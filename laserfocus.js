/*import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


/*class MouseController extends Scene{
    constructor(canvas)
    {
        this.current = {
            mouseX: 0,
            mouseY: 0,
            mouseXchange: 0,
            mouseYchange: 0,
            leftClick: false,
            rightClick: false,
        };
        this.previous = null;
        
        
        canvas.addEventListener('mousemove', (e) =>this.onMouseMove(e), false);
    }
    onMouseMove(e){
        this.current.mouseX = e.pageX - window.innerWidth /2;
        this.current.mouseY = e.pageY - window.innerWidth /2;
        if(this.previous===null){
            this.previous = {...this.current};
        }
        this.current.mouseXchange = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYchange = this.current.mouseY - this.previous.mouseY;

        this.previous.mouseX = this.current.mouseX;
        this.previous.mouseY = this.current.mouseY;
    }
    /*onMouseDown(e){
        switch (e.button){
            case 0:
            {
                this.current.leftClick = true;
                break;
            }
            case 2: 
            {
                this.current.rightClick = true;
                break;
            }
        }
    }
    onMouseUp(e){
        switch(e.button){
            case 0:{
                this.current.leftClick = false;
                break;
            }
            case 2:{
                this.current.rightClick=false;
                break;
            }
        }
    }
}*/


/*
export class laserfocus extends Scene{
    constructor(){
        super();
        this.shapes = {
            target: new defs.Subdivision_Sphere(4),
        };

        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: .6, color:hex_color("#88008F")}),
        }
        
        //this.input = new MouseController(canvas);
        this.current = {
            mouseX: 0,
            mouseY: 0,
            mouseXchange: 0,
            mouseYchange: 0,
            leftClick: false,
            rightClick: false,
        };
        this.previous = null;
        
        
        this.eye = vec3(0,0,0);
        this.at= vec3(1,0,0);
        this.up = vec3(0,1,0);
        this.rotation_y = 0;                   // Rotation around the y-axis
        this.rotation_x = 0;                    //Rotation around the x-axis

        document.addEventListener('mousemove', (e) =>this.onMouseMove(e), false);
        
        this.senstivity = 0.02;
        
        this.updateView_Matrix();
    }


    updateView_Matrix()
    {
        this.View_Matrix = Mat4.look_at(this.eye,this.at,this.up);
    }

    onMouseMove(e){
        this.current.mouseX = e.clientX - window.innerWidth /2;
        this.current.mouseY = e.clientY - window.innerHeight /2;
        if(this.previous===null){
            this.previous = {...this.current};
        }
        this.current.mouseXchange = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYchange = this.current.mouseY - this.previous.mouseY;

        this.previous.mouseX = this.current.mouseX;
        this.previous.mouseY = this.current.mouseY;
        this.move_camera();
    }

    move_camera()
    {
        this.rotation_y = this.current.mouseXchange * this.sensitivity;
        this.rotation_x = this.current.mouseYchange * this.sensitivity;

        // Clamp the pitch to prevent flipping
        
        const rotationMatrixY = [
            [Math.cos(this.rotation_y), 0, Math.sin(this.rotation_y)],
            [0, 1, 0],
            [-Math.sin(this.rotation_y), 0, Math.cos(this.rotation_y)]
        ];


        this.at[0] = rotationMatrixY[0][0] * this.at[0] + rotationMatrixY[0][2] * this.at[2];
        this.at[1] = this.at[1];
        this.at[2] = rotationMatrixY[2][0] * this.at[0] + rotationMatrixY[2][2] * this.at[2];

        const maxRotationX = Math.PI / 2 - 0.01;
        if (this.rotation_x > maxRotationX) this.rotation_x = maxRotationX;
        if (this.rotation_x < -maxRotationX) this.rotation_x = -maxRotationX;

        const maxRotationY = Math.PI/2 - 0.01;
        if (this.rotation_y > maxRotationY) this.rotation_x = maxRotationY;
        if (this.rotation_y < -maxRotationY) this.rotation_x = -maxRotationY;

        // Calculate the new lookAtPoint based on yaw and pitch
        const direction = vec3(
            Math.cos(this.rotation_x) * Math.sin(this.rotation_y),
            Math.sin(this.rotation_x),
            Math.cos(this.rotation_x) * Math.cos(this.rotation_y)
        );

        this.at = this.eye.plus(direction);
        this.up = this.eye.plus(direction);

        this.updateView_Matrix();
    }

    display(context,program_state){

        /*if (!context.scratchpad.controls) {
            //this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.View_Matrix);
        } */ 
        /*
        program_state.set_camera(this.View_Matrix);
        
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 100);

        
        let model_transform = Mat4.identity();
        const light_position = vec4(0,0, 0, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)]; 
                
        this.shapes.target.draw(context,program_state, model_transform.times(Mat4.translation(4,0,0)), this.materials.test);
        //program_state.set_camera(this.View_Matrix);
        console.log("This.up: ", this.up, "This.at: ", this.at);
        
    }

    

}*/
import {defs, tiny} from './examples/common.js';
const {vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Material, Scene} = tiny;

export class laserfocus extends Scene {
    constructor() {
        super();
        this.shapes = { 
            target: new defs.Subdivision_Sphere(4),
            wall: new defs.Square(),
        };
        this.materials = { 
            test: new Material(new defs.Phong_Shader(), 
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#88008F") }),
            wall_material: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#FF0000")}) 
        };
        
        // Initialize an array to store the positions of the spheres
        this.sphere_positions = [
            vec3(0,0,20),
            vec3(10, 0, 20),
            vec3(-10, 0, 20),
            vec3(0, 10, 20),
            vec3(0, -10, 20),
            vec3(10, 10, 20),
            vec3(-10, -10, 20),
            vec3(-10,10,20),
            vec3(10,-10,20)
        ];

        this.eye = vec3(0, 0, 0); // Position of the camera
        this.at = vec3(1, 0,0);   // Where the camera is looking at
        this.up = vec3(0, 1, 0);   // Up direction vector

        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.02;

        document.addEventListener('mousemove', e => this.onMouseMove(e));
        this.updateViewMatrix();
    }

    updateViewMatrix() {
        const direction = vec3(
            Math.cos(this.pitch) * Math.sin(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.cos(this.yaw)
        );
        this.at = this.eye.plus(direction);


        this.View_Matrix = Mat4.look_at(this.eye, this.at, this.up);
    }

    onMouseMove(e) {
        this.yaw -= e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity; // Inverting y-axis movement for more natural control

        // Clamp the pitch
        const maxPitch = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        this.updateViewMatrix();
    }

    display(context, program_state) {
        program_state.set_camera(this.View_Matrix);
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);
        
        let model_transform = Mat4.identity();
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        const room_size = 100;

        // FRONT WALL
        let front_wall_transform = Mat4.translation(0, 0, -room_size / 2).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, front_wall_transform, this.materials.wall_material);

        // LEFT WALL
        let left_wall_transform = Mat4.translation(-room_size / 2, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, left_wall_transform, this.materials.wall_material.override({color: hex_color("#0000FF")}));

        // RIGHT WALL
        let right_wall_transform = Mat4.translation(room_size / 2, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, right_wall_transform, this.materials.wall_material.override({color: hex_color("#00FF00")}));

        // BACK WALL
        let back_wall_transform = Mat4.translation(0, 0, room_size / 2).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, back_wall_transform, this.materials.wall_material.override({color: hex_color("#FFFF00")}));

        // Draw each sphere at its respective position
        for (let position of this.sphere_positions) {
        let model_transform = Mat4.translation(...position);
        this.shapes.target.draw(context, program_state, model_transform, this.materials.test);
}
        //this.shapes.target.draw(context, program_state, model_transform.times(4,0,0), this.materials.test);
        console.log("drew shape");
        console.log("Camera At:", this.at, "Camera Up:", this.up);
    }

}