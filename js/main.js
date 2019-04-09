window.onload = function(){
  let context
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

  let images = {white:white,1:wall,0:bg,3:point,4:yellow,7:red,5:down,8:down}
  let end = []
  let position = {}
  let Checkpoint;
  let current = 0
  let lastItem = 0
  let step = 0
  if (canvas.getContext) {
    context = canvas.getContext('2d')
  }

  refresh.addEventListener('click',function(e){
      make_game(games[current],current)
  },false)
  meau_main.addEventListener('click',function(e){
    if (e.target.tagName == 'LI') {
      let classList = items[lastItem].className.split(' ')
      items[lastItem].className = classList.filter(function (item){
        return item != 'active'
      }).join(' ')
      make_game(games[e.target.innerText-1],e.target.innerText-1)
    }
  },true)

  function make_game(game_map,index){
    current = index
    lastItem = index
    end = []
    step = 0
    totle_step()
    Checkpoint = deepClone(game_map)
    mode.innerText = current > 6 ? '困难' : '简单'
    check_no.innerText = current+1
    items[current].className += ' active'
    game_box.style.width = Checkpoint.length*50
    game_box.style.height = Checkpoint.length*50
    canvas.height = Checkpoint.length*50
    canvas.width = Checkpoint[0].length*50
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
            context.drawImage(images[3],j*50,i*50,50,50)
            mark_end(i,j)
            break;
          case 4:
            context.drawImage(images[4],j*50,i*50,50,50)
            break;
          case 5:
          case 8:
            context.drawImage(images[0],j*50,i*50,50,50)
            context.drawImage(images[5],j*50,i*50,50,50)
            position.row = i
            position.column = j
            break;
          case 7:
            context.drawImage(images[7],j*50,i*50,50,50)
            mark_end(i,j)
        }
      }
    }
  }
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
  function move(row,column,oldRow,oldColumn){
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
  function mark_end(row,column){
    end.push({row, column})
  }
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
  function totle_step(){

    computed_number.innerText = step++;
  }
  make_game(games[current],current)
}
