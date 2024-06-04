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
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#4dff00") }),
            wall_material: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#cac1e2")}) ,
            crosshair_mat: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#FFFFFF")},),
        };
        
        // Initialize an array to store the positions of the spheres
        this.sphere_positions = [];

        for(let i =0; i<15;i++)
        {
            for(let j =0; j<7; j++)
            {
                for(let k=0; k<7;k++)
                this.sphere_positions.push(vec3(i*5,j*5,20+(k*2)));
            }
        }
        this.eye = vec3(0, 0, -30); // Position of the camera
        this.at = vec3(1, 0,0);   // Where the camera is looking at
        this.up = vec3(0, 1, 0);   // Up direction vector

        this.timer = 0;
        this.reset_spawn_timer = 750;
        this.max_spawn_timer = 1.5*this.reset_spawn_timer;
        this.index = this.getRandIndex();

        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.02;


        this.last_time = 0;  // Time of the last frame
        this.move_speed = 30;  // Speed of the camera movement
        this.move_direction = vec3(0, 0, 0);  // Current movement direction vector

        this.key_map = {};  // Tracks which keys are being pressed
        this.setupEventHandlers();

        this.updateViewMatrix();
    }

    setupEventHandlers() {
        document.addEventListener('keydown', e => this.moveCamera(e));
        document.addEventListener('mousemove', e => this.onMouseMove(e));
        document.addEventListener('click', e => this.onMouseClick(e));
    }

    moveCamera(event) {
        const moveStep = 10;
        // Extract only the x and z components of the direction vector and normalize
        let forward = vec3(this.at[0] - this.eye[0], 0, this.at[2] - this.eye[2]).normalized();
        let right = forward.cross(this.up).normalized(); // Right direction, already on the x-z plane
    
        switch (event.key) {
            case "w":
                this.eye = this.eye.plus(forward.times(moveStep));
                this.at = this.at.plus(forward.times(moveStep));
                break;
            case "s":
                this.eye = this.eye.minus(forward.times(moveStep));
                this.at = this.at.minus(forward.times(moveStep));
                break;
            case "a":
                this.eye = this.eye.minus(right.times(moveStep));
                this.at = this.at.minus(right.times(moveStep));
                break;
            case "d":
                this.eye = this.eye.plus(right.times(moveStep));
                this.at = this.at.plus(right.times(moveStep));
                break;
        }
        this.updateViewMatrix();
        event.preventDefault();
    }

    getRandIndex()
    {
        const i = Math.floor(Math.random() * 735);
        return i;
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

    onMouseClick(e) {
        const rayDir = this.at.minus(this.eye).normalized();
        let rayOrigin = this.eye;
        let spherePos = this.sphere_positions[this.index];

        const radius = 3; // Sphere radius
        const oc = rayOrigin.minus(spherePos);
        // Calculate quadratic equation components
        const a = rayDir.dot(rayDir);
        const b = 2.0 *oc.dot(rayDir);
        const c = oc.dot(oc) - (radius*radius);

        const discriminant = (b * b) - (4 *c);
        console.log("Sphere Pos:", spherePos);
        console.log("Sphere Radius:", radius);
        console.log("rayDir:", rayDir);
        console.log("rayOrigin", rayOrigin);
        console.log("Discriminant:", discriminant);
        console.log("this.at", this.at);

        if (discriminant < 0) {
            console.log("Missed sphere at index:", this.index);
        } else {
            const t1 = (-b+Math.sqrt(discriminant))/(2.0*a);
            const t2 = (-b+Math.sqrt(discriminant))/(2.0*a);
            /*if(t1<0 &&t2<0)
            {
                console.log("Missed Sphere");
            }
            else{*/
                console.log("Hit Sphere at Index:", this.index);
            //}

        }
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
        
        //const t = program_state.animation_time / 1000;

        const room_size = 100;

        // FRONT WALL
        let front_wall_transform = Mat4.translation(0, 0, -room_size).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, front_wall_transform, this.materials.wall_material);
        // LEFT WALL
        let left_wall_transform = Mat4.translation(-room_size, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, left_wall_transform, this.materials.wall_material);

        // RIGHT WALL
        let right_wall_transform = Mat4.translation(room_size, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, right_wall_transform, this.materials.wall_material);

        // BACK WALL
        let back_wall_transform = Mat4.translation(0, 0, room_size).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, back_wall_transform, this.materials.wall_material);

        
        // FLOOR
        let floor_transform = Mat4.translation(0, -25, 0).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, floor_transform, this.materials.wall_material.override({color:hex_color("#84808c")}));

        // ROOF
        let roof_transform = Mat4.translation(0, 25, 0).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, roof_transform, this.materials.wall_material.override({color: hex_color("#FFFFFF")}));
        
        if(this.timer<this.reset_spawn_timer){
            let target_transform = Mat4.translation(...this.sphere_positions[this.index]).times(Mat4.translation(-15,-15,0)).times(Mat4.scale(3,3,3));
            this.shapes.target.draw(context,program_state,target_transform,this.materials.test);
            
        }
        if(this.timer>this.max_spawn_timer)
        {
            this.timer = 0;
            this.index = this.getRandIndex();
        }
        


        // Draw each sphere at its respective position
        /*for (let position of this.sphere_positions) {
        let model_transform = Mat4.translation(...position).times(Mat4.translation(-35,-15,0));
        this.shapes.target.draw(context, program_state, model_transform, this.materials.test);
        }  */
        //this.shapes.target.draw(context, program_state, model_transform.times(4,0,0), this.materials.test);
        //console.log("drew shape");
        //console.log("Camera At:", this.at, "Camera Up:", this.up);
        this.drawCrosshair(context, program_state);

        
        this.timer++;
    }

}
