import {defs, tiny} from './examples/common.js';
const {vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Material, Scene} = tiny;

export class laserfocus extends Scene {
    constructor() {
        super();
        this.shapes = { 
            target: new defs.Subdivision_Sphere(4),
            wall: new defs.Square(),
            crosshair_line: new defs.Subdivision_Sphere(4),
        };
        this.materials = { 
            test: new Material(new defs.Phong_Shader(), 
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#88008F") }),
            wall_material: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#FF0000")}) ,
            crosshair_mat: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#FFFFFF")},),
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

    requestPointerLock(){
        this.canvas.requestPointerLock();
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

    drawCrosshair(context, program_state) {
        let crosshair_transform = Mat4.identity();
        crosshair_transform = crosshair_transform.times(Mat4.translation(this.at[0],this.at[1],this.at[2])).times(Mat4.scale(0.003,0.003,0.003));
        this.shapes.crosshair_line.draw(context,program_state,crosshair_transform,this.materials.crosshair_mat);
    }

    display(context, program_state) {
        program_state.set_camera(this.View_Matrix);
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);
        
        let model_transform = Mat4.identity();
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        const room_size = 100;

        // FRONT WALL
        let front_wall_transform = Mat4.translation(0, 0, -room_size).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, front_wall_transform, this.materials.wall_material);

        // LEFT WALL
        let left_wall_transform = Mat4.translation(-room_size, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, left_wall_transform, this.materials.wall_material.override({color: hex_color("#0000FF")}));

        // RIGHT WALL
        let right_wall_transform = Mat4.translation(room_size, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, right_wall_transform, this.materials.wall_material.override({color: hex_color("#00FF00")}));

        // BACK WALL
        let back_wall_transform = Mat4.translation(0, 0, room_size).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, back_wall_transform, this.materials.wall_material.override({color: hex_color("#FFFF00")}));

        // Draw each sphere at its respective position
        for (let position of this.sphere_positions) {
        let model_transform = Mat4.translation(...position);
        this.shapes.target.draw(context, program_state, model_transform, this.materials.test);
}
        //this.shapes.target.draw(context, program_state, model_transform.times(4,0,0), this.materials.test);
        console.log("drew shape");
        console.log("Camera At:", this.at, "Camera Up:", this.up);
        this.drawCrosshair(context, program_state);
    }

}
