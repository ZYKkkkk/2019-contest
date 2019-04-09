window.onload = function(){
  //获取DOM元素
  let meau_main = document.querySelector('#meau_main')
  let hard_list = document.querySelector('hard_list')
  let refresh = document.querySelector('#refresh')
  let canvas = document.querySelector('canvas')
  let wall = document.querySelector('#wall')
  let bg = document.querySelector('#bg')
  let point = document.querySelector('#point')
  let red = document.querySelector('#red')
  let yellow = document.querySelector('#yellow')
  let down = document.querySelector('#down')
  let white = document.querySelector('#white')
  let game_box = document.querySelector('.game_box')
  let mode = document.querySelector('#mode')
  let check_no = document.querySelector("#check_no")
  let computed_number = document.querySelector('#computed_number')
  let items = document.querySelectorAll('li')
  //定义用到的变量
  //images中放置需要用到的图片，和图片对应的一个数字 -> Object
  let images = {white:white,1:wall,0:bg,3:point,4:yellow,7:red,5:down,8:down}
  //end数组中保存当前关卡的终点的位置，方便进行验证是否过关
  let end = []
  //position是当前小人的位置，这样就不需要每次发生移动的时候都去遍历数组寻找小人的位置
  let position = {}
  //Checkpoint为当前关卡的一个副本，是由关卡进行深拷贝得来的， 操作数据时对副本进行操作
  //对原先关卡没有影响
  let Checkpoint;
  //current为当前关卡数-1
  let current = 0
  //lastItem为上一次关卡对应的li列表的index值
  let lastItem = 0
  //step保存总步数
  let step = 0
  //context为用于在画布上绘图的环境
  let context
  if (canvas.getContext) {
    context = canvas.getContext('2d')
  }
  //refresh为重试当前关卡，
  //原理为重新在canvas中画当前关卡，将关卡重置
  refresh.addEventListener('click',function(e){
      make_game(games[current],current)
  },false)
  //添加关卡选择功能
  //给所有li的共同父元素绑定click事件，利用事件捕获，实事件委托给父元素
  meau_main.addEventListener('click',function(e){
    if (e.target.tagName == 'LI') {//判断被点击元素是否是li元素
      //清除掉上一个选中元素的active类
      let classList = items[lastItem].className.split(' ')
      items[lastItem].className = classList.filter(function (item){
        return item != 'active'
      }).join(' ')
      //生成当前元素对应的关卡
      make_game(games[e.target.innerText-1],e.target.innerText-1)
    }
  },true)
  //生成关卡
  /*
   *@method make_game
   *@param {Array} game_map 存放关卡的二维数组
   *@param {Number} index 关卡所对应的索引值
  */
  function make_game(game_map,index){
    //初始化数据
    //初始化终点、步数
    current = index
    end = []
    step = 0
    totle_step()
    //通过深拷贝拿到存放关卡二维数组的副本
    Checkpoint = deepClone(game_map)
    //修改DOM相应的信息
    mode.innerText = current > 6 ? '困难' : '简单'
    check_no.innerText = current+1
    items[current].className += ' active'
    game_box.style.width = Checkpoint.length*50
    game_box.style.height = Checkpoint.length*50
    canvas.height = Checkpoint.length*50
    canvas.width = Checkpoint[0].length*50
    //对二维数组进行遍历画出地图
    for(let i = 0,len = Checkpoint.length;i<len;i++){
      for(let j = 0,l = Checkpoint[i].length;j<l;j++){
        switch (Checkpoint[i][j]) {
          case -1:
            context.drawImage(images.white,j*50,i*50,50,50)
            break;
          case 0:
            context.drawImage(images[0],j*50,i*50,50,50)
            break
          case 1:
            context.drawImage(images[1],j*50,i*50,50,50)
            break;
          case 3:
            //当值为3的时候说明是一个箱子的终点
            //所以需要标记当前的位置
            context.drawImage(images[3],j*50,i*50,50,50)
            mark_end(i,j)
            break;
          case 4:
            context.drawImage(images[4],j*50,i*50,50,50)
            break;
          case 5:
          case 8:
            //值为5或8的时候说明是一个小人，需要标记当前小人的位置
            context.drawImage(images[0],j*50,i*50,50,50)
            context.drawImage(images[5],j*50,i*50,50,50)
            position.row = i
            position.column = j
            break;
          case 7:
            //当值为7的时候说明是一个箱子的终点
            //所以需要标记当前的位置
            context.drawImage(images[7],j*50,i*50,50,50)
            mark_end(i,j)
        }
      }
    }
    lastItem = index
  }

  //对当前页面添加keyup事件，对wasd 上下左右做出不同的相应，执行move方法进行判断和处理
  //每次执行完移动后都去判断是否已经结束
  document.body.addEventListener('keyup',function(e){
    let code = e.keyCode
    switch (code) {
      case 87:
      case 38:
        move(position.row-1,position.column,position.row,position.column)
        check_end()
        break;
      case 83:
      case 40:
        move(position.row+1,position.column,position.row,position.column)
        check_end()
        break;
      case 65:
      case 37:
        move(position.row,position.column-1,position.row,position.column)
        check_end()
        break;
      case 68:
      case 39:
        move(position.row,position.column+1,position.row,position.column)
        check_end()
        break;

    }
  },true)

  /*
   *@method
   *@param {Number} row 需要移动的行的值
   *@param {Number} column 需要移动的列的值
   *@param {Number} oldRow 当前行的值
   *@param {Number} oldColumn 当前列的值
   */
  function move(row,column,oldRow,oldColumn){
    //判断下一步的位置是否为空地或终点，如果是则可以移动，并且更新下一步位置，与当前位置
    //计算总步数
    if (Checkpoint[row][column] == 3 || Checkpoint[row][column] == 0) {
      Checkpoint[oldRow][oldColumn] -= 5
      Checkpoint[row][column] += 5
      if (Checkpoint[oldRow][oldColumn] == 0) {
        context.drawImage(images[0],oldColumn*50,oldRow*50,50,50)
      }else{
        context.drawImage(images[3],oldColumn*50,oldRow*50,50,50)
      }
      context.drawImage(images[5],column*50,row*50,50,50)
      position.row = row
      position.column = column
      totle_step()
    }else if(Checkpoint[row][column] == 7 || Checkpoint[row][column] == 4){
      //判断下一步位置是否是箱子，如果是箱子那么箱子的下一个位置是否为空地或终点
      //如果可以移动则更新视图
      //计算总步数
      let distance_row = row - oldRow
      let datalist_column = column - oldColumn
      if (Checkpoint[row+distance_row][column+datalist_column] == 0 || Checkpoint[row+distance_row][column+datalist_column] == 3 ) {
        Checkpoint[row][column] += 1
        Checkpoint[oldRow][oldColumn] -= 5
        Checkpoint[row+distance_row][column+datalist_column] += 4
        if (Checkpoint[oldRow][oldColumn] == 0) {

          context.drawImage(images[0],oldColumn*50,oldRow*50,50,50)
        }else{
          context.drawImage(images[3],oldColumn*50,oldRow*50,50,50)
        }
        context.drawImage(images[0],column*50,row*50,50,50)
        context.drawImage(images[5],column*50,row*50,50,50)
        if (Checkpoint[row+distance_row][column+datalist_column] == 7) {
          context.drawImage(images[7],(column+datalist_column)*50,(row+distance_row)*50,50,50)
        }else{
          context.drawImage(images[4],(column+datalist_column)*50,(row+distance_row)*50,50,50)
        }
        position.row = row
        position.column = column
        totle_step()
      }
    }
  }
  /*
   *@method
   *@param {Number} row 需要标记的行的位置
   *@param {Number} column 需要标记列的位置
   */
  function mark_end(row,column){
    end.push({row, column})
  }
  /*
   *@method
   *检查终点上是否全有箱子
   *如果有箱子则闯关成功，进行下一关
   *修改当前关卡对应的li的样式
   */
  function check_end(){
    count = end.length
    for(let i = 0,len = end.length;i<len;i++){
      if (Checkpoint[end[i].row][end[i].column] == 7) {
        count--
      }
    }

    if (count == 0 && current <= games.length-2) {
      current += 1
      setTimeout(function(){
        make_game(games[current],current)
        if (current <=6) {
        items[current-1].className = 'item finish'
        items[current].className +=  ' active'
        }
      },500)
    }else if(count == 0 && current == games.length-1){
      setTimeout(function(){
        items[current].className = 'item finish'
        alert('恭喜通关!')
      },500)
    }

  }
  /*
   *@method
   *@param {Object} target 需要进行深拷贝的元素
   *@returns {Object} 深拷贝对象的副本
   */
  function deepClone(target){
    if (Array.isArray(target)) {
      let arr = []
      for(let i = 0,l = target.length;i<l;i++){
        if (Array.isArray(target[i])) {
          arr.push(deepClone(target[i]))
        }else{
          arr.push(target[i])
        }
      }
      return arr
    }
  }
  /*
   *@method
   *计算当前关卡的总步数
   */
  function totle_step(){
    computed_number.innerText = step++;
  }
  //生成第一关
  make_game(games[current],current)
}
