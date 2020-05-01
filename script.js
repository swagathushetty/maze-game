const {Engine,Render,Runner,World,Bodies,Body,Events}=Matter;

const cellsHorizontal=10
const cellsVertical=10
const width=window.innerWidth;
const height=window.innerHeight;

const unitLengthX=width/cellsHorizontal;
const unitLengthY=height/cellsVertical;

//creating new enigne
const engine=Engine.create();
engine.world.gravity.y=0; //disable gravity in y direction

//accesing world we created with new engine
const {world}=engine;

//show the contents in the screen
const render=Render.create({
    element:document.body, //where to render
    engine:engine,         //what engine to use
    options:{              
        wireframes:false,
        //size of the content
        width:width,
        height:height
    }
})


Render.run(render)   //draw all the objects on screen
Runner.run(Runner.create(),engine)  //manages changes in state

// //adding mouse drag support
// World.add(world,MouseConstraint.create(engine,{
//     mouse:Mouse.create(render.canvas)
// }))


// Boilerplate code ends 
// ####################################################################

// //creating and adding shape
// const shape=Bodies.rectangle(200,200,50,50,{ //x,y.size,size
//     isStatic:true
// });
// World.add(world,shape) //add the shape to thw world


//Walls
const walls=[
    Bodies.rectangle(width/2,0,width,2,{isStatic:true}),
    Bodies.rectangle(width/2, height, width,2, { isStatic: true }),
    Bodies.rectangle(0, height/2, 2, height, { isStatic: true }),
    Bodies.rectangle(width, height/2, 2, height, { isStatic: true }),
]
World.add(world,walls)

//mazre generation
const shuffle=(arr)=>{
    // console.log(arr)
    let counter=arr.length;

    while(counter>0){
        const index=Math.floor(Math.random()*counter)

        counter--;

        const temp=arr[counter]
        arr[counter]=arr[index]
        arr[index]=temp
    }
    return arr;
}



const grid=Array(cellsVertical).fill(null).map(()=>{
    return Array(cellsHorizontal).fill(false)
})


const verticals=Array(cellsVertical)
.fill(null)
.map(()=>{
    return Array(cellsHorizontal-1).fill(false)
})


const horizontals = Array(cellsVertical-1)
.fill(null)
.map(() => {
    return Array(cellsHorizontal).fill(false)
 })
 

const startRow=Math.floor(Math.random()*cellsVertical)
const startColumn = Math.floor(Math.random() * cellsHorizontal)
// console.log(startRow,startColumn)

// console.log(grid)

const stepThroughCell=(row,column)=>{
    // console.log('row and column are',row,column)

    //if we visited the cell at [row,column] then return
    if(grid[row][column]){
        return
    }

    //mark cell as being visited
    grid[row][column]=true;


    //assemble the randomly ordered list neighbour
    //we shuffle neighbours to create randomness
     let neighbours = shuffle([
        [row - 1, column,'up'],
        [row, column + 1,'right'],
        [row + 1, column,'down'],
        [row, column - 1,'left']
    ])

    // console.log('neighures ',neighbours)
    //for each neighbour
    for(let neighbour of neighbours){
        const[nextRow,nextColumn,direction]=neighbour;

            //see if negigbour is out of bound
            if (
                nextRow < 0 ||
                nextRow >= cellsVertical ||
                nextColumn < 0 ||
                nextColumn >= cellsHorizontal
            ) {
                continue;
            }

            //if we visited the neighbour continue to next neighbour
            if(grid[nextRow][nextColumn]){
                continue;
            }
            //remove wall from either horizontals or verticals
            if(direction==='left'){
                verticals[row][column-1]=true;
            }else if(direction==='right'){
                verticals[row][column]=true;
            }else if(direction==='up'){
                horizontals[row-1][column]=true;
            }else if(direction==='down'){
                horizontals[row][column]=true;
            }

            // console.log('vertical and horizontal',verticals,horizontals)

            //visit the next cell
            stepThroughCell(nextRow,nextColumn)


            
    }
    // console.log('veritical array is', verticals)
    


}

// stepThroughCell(startRow,startColumn)
stepThroughCell(1, 1)


//building horizontal walls
horizontals.forEach((row,rowIndex)=>{
    row.forEach((open,columnIndex)=>{
        if(open){
            return
        }
        const wall=Bodies.rectangle(
            columnIndex*unitLengthX+unitLengthX/2, //x-axis distance to the centre from origin
            rowIndex*unitLengthY+unitLengthY, //y-axis distance from origin to the rectangle
            unitLengthX, //length or width of one cell
            5, //how tall is the wall(f)
            {
                label:'wall',
                isStatic:true,
                render:{
                    fillStyle:'red'
                }
            }
        )
        World.add(world,wall)
    })
})

verticals.forEach((row,rowIndex)=>{
    row.forEach((open,columnIndex)=>{
        if(open){
            return
        }
        const wall=Bodies.rectangle(
            columnIndex*unitLengthX+unitLengthX,
            rowIndex*unitLengthY+unitLengthY/2,
            5,
            unitLengthY,{
                label:'wall',
                isStatic:true,
                render: {
                    fillStyle: 'red'
                }
            }
        )
        World.add(world,wall)
    })
})



//goal
const goal=Bodies.rectangle(
    width-unitLengthX/2,
    height-unitLengthY/2,
    unitLengthX*0.7,
    unitLengthY*0.7,
    {
        label:'goal',
        isStatic:true,
        render: {
            fillStyle: 'green'
        }
    }
)

World.add(world,goal)


//ball
const ballRadius=Math.min(unitLengthX,unitLengthY)/4;
const ball=Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,
    {
        label:'ball',
        render: {
            fillStyle: 'blue'
        }
    }
)
World.add(world,ball)


document.addEventListener('keydown',event=>{

    const {x,y}=ball.velocity;
    if(event.keyCode===87){
        Body.setVelocity(ball,{x,y:y-5})
    }
    if (event.keyCode === 68) {
        Body.setVelocity(ball, { x:x+5, y })
    }
    if (event.keyCode === 83) {
        Body.setVelocity(ball, { x, y: y + 5 })
    }
    if (event.keyCode === 65) {
        Body.setVelocity(ball, { x: x - 5, y })
    }
})


//win condition
Events.on(engine,'collisionStart',event=>{
    event.pairs.forEach((collision)=>{
        const labels=['ball','goal']

        if(
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ){
            document.querySelector('.winner').classList.remove('hidden')
            world.bodies.forEach((body)=>{
                Body.setStatic(body,false)
            })
        }
    })
})