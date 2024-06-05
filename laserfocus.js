import {defs, tiny} from './examples/common.js';
import { Text_Line } from "./examples/text-demo.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const {vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Material, Vector3, Scene, Texture} = tiny;

export class laserfocus extends Scene {
    constructor() {
        super();
        this.shapes = { 
            target: new defs.Subdivision_Sphere(4),
            wall: new defs.Square(),
            bullet: new defs.Square(),
            background: new defs.Square(),
            floor: new defs.Square(), 
            showlight: new defs.Rounded_Capped_Cylinder(100,100),
            text: new Text_Line(35),
            cube: new defs.Cube()
        };
        this.materials = { 
            test: new Material(new defs.Phong_Shader(), 
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#00a6f1") }),
            wall_material: new Material(new defs.Phong_Shader(),
                {ambient: 0.4, diffusivity: 0.6, color: hex_color("#cac1e2")}) ,
            crosshair_mat: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#FFFFFF")},),

            floor_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.75,
                texture: new Texture("assets/floor_texture3.png")
            }),
            wall_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 0.75,
                texture: new Texture("assets/TargetWall.png", "LINEAR_MIPMAP_LINEAR")
            }),
            target_texture: new Material(new defs.Textured_Phong(),{
                color: hex_color("#000000"),
                ambient: 1, 
                texture: new Texture("assets/purple_swirly.png")
            }),
            text_image: new Material(new defs.Textured_Phong(), {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")
            }),
            bullet_hole: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/bullet_hole.png")
            }),
            crosshair_texture: new Material(new defs.Textured_Phong(), {
                color: hex_color("#910703"),
                ambient:1,
                texture: new Texture("assets/crosshair.png")
            }),
            background: new Material(new defs.Textured_Phong(),{
                color:hex_color("#000000"),
                ambient: 1,
                texture: new Texture("assets/purple_swirly.png")
            }),
            gun_barrel: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#00FFFF")}),
            gun_barrel_ring: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: 0, color: hex_color("#FF0000")}),
        };
        this.shapes.wall.arrays.texture_coord.forEach(p => p.scale_by(8));
        this.shapes.floor.arrays.texture_coord.forEach(p=>p.scale_by(1));
        this.shapes.target.arrays.texture_coord.forEach(p=>p.scale_by(1));
        this.shapes.background.arrays.texture_coord.forEach(p=>p.scale_by(1));
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
        this.look_direction = this.at.minus(this.eye).normalized();

        this.timer = 0;
        this.game_timer=0;
        this.game_end_flag = true;
        this.max_game_time = 600;

        this.start_flag = true;
        this.pause_flag = false;

        this.reset_spawn_timer = 150;
        this.max_spawn_timer = 1.5*this.reset_spawn_timer;
        this.index = this.getRandIndex();
        this.target_transform = Mat4.identity();
        this.updateTargetPosition();

        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.02;


        this.last_time = 0;  // Time of the last frame
        this.move_speed = 30;  // Speed of the camera movement
        this.move_direction = vec3(0, 0, 0);  // Current movement direction vector

        this.key_map = {};  // Tracks which keys are being pressed
        this.setupEventHandlers();

        this.score = 0;
        this.miss=0;

        this.bullet_marks = [];
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
        
        let newEye = this.eye.copy();
        let newAt = this.at.copy();
        
        switch (event.key) {
            case "w":
                newEye = newEye.plus(forward.times(moveStep));
                newAt = newAt.plus(forward.times(moveStep));
                break;
            case "s":
                newEye = newEye.minus(forward.times(moveStep));
                newAt = newAt.minus(forward.times(moveStep));
                break;
            case "a":
                newEye = newEye.minus(right.times(moveStep));
                newAt = newAt.minus(right.times(moveStep));
                break;
            case "d":
                newEye = newEye.plus(right.times(moveStep));
                newAt = newAt.plus(right.times(moveStep));
                break;
            case " ": //used to start the game and the start or end screens
                if(this.start_flag == true || this.game_end_flag == true){
                    this.game_end_flag = false;
                    this.start_flag = false;
                    this.score = 0;
                    this.miss = 0;
                    this.timer = 0;
                    this.game_timer=0;
                    document.body.requestPointerLock();
                }
                else if (!this.pause_flag){
                    this.pause_flag = true;
                    document.exitPointerLock();
                }
                else{
                    this.pause_flag = false;
                    document.body.requestPointerLock();
                }
                break;
            
        }
        
        // Collision detection with walls
        const roomSize = 100;
        if(!this.pause_flag && !this.game_end_flag){
            if (Math.abs(newEye[0]) <= roomSize - 1 && Math.abs(newEye[2]) <= roomSize - 1 && newEye[1] >= -25 && newEye[1] <= 25) {
                this.eye = newEye;
                this.at = newAt;
                this.updateViewMatrix();
            }
        }
        
    
        event.preventDefault();
    }
    
    getRandIndex()
    {
        const i = Math.floor(Math.random() * 735);
        return i;
    }

    updateTargetPosition()
    {
        this.target_transform = Mat4.translation(...this.sphere_positions[this.index]).times(Mat4.translation(-15,-15,0)).times(Mat4.scale(3,3,3));
        console.log("Target position:", this.target_transform);
    }

    updateViewMatrix() {
        const direction = vec3(
            Math.cos(this.pitch) * Math.sin(this.yaw),
            Math.sin(this.pitch),
            Math.cos(this.pitch) * Math.cos(this.yaw)
        );
        this.at = this.eye.plus(direction);
        this.View_Matrix = Mat4.look_at(this.eye, this.at, this.up);
        this.look_direction = this.at.minus(this.eye);
    }

    onMouseClick(e) {  
        if(this.start_flag){
        
        }     
        if(!this.game_end_flag && !this.pause_flag) {
            this.checkTargetIntersection();
        }
        else{
            
        }
    }

    checkTargetIntersection(){
        /*
        Explanation: Uses Ray Casting to detect necessary collisions.

        This works by casting a ray from this.eye to this.at and checking if that ray has any real solutions with the sphere target.
        The ray equation is given by R(t) = O + Dt, where O is this.eye and D is the direction of the ray. (this.eye -> this.at)
        The sphere equation is given by r^2 = |P - C|^2 where P is any point on the sphere, C is the center of the sphere, and r is the radius of the sphere.
        By substituting the equation of the ray into the sphere equation, can find a function for t as the following:
        (* represents the dot product and x represents scalar multiplication)
        (D*D)t^2 + (2 x (O-C)*D)t + (O-C)*(O-C) - r^2 = 0.
        From this, can find a solution using the quadratic formula. A real solution for t exists only if the discriminant is greater than 0.
        This then determines if the ray cast from the eye intersects with the target sphere, thus indicating the player has shot the sphere.
        */
        const radius = 3; 
        const sphere_center = this.target_transform.times(vec4(0, 0, 0, 1)).to3(); // Extract the sphere's position from the target transform
        
        const ray_direction = this.look_direction;
        
        // Vector from ray origin to sphere center
        const oc = sphere_center.minus(this.eye);
        
        // Coefficients for the quadratic equation
        const a = ray_direction.dot(ray_direction);
        const b = 2.0 * oc.dot(ray_direction);
        const c = oc.dot(oc) - radius * radius;
        
        // Calculate the discriminant
        const discriminant = b * b - 4 * a * c;
        
        //if the discriminant >0, then there exists a real solution for the intersection between the ray and the sphere
        if (discriminant >= 0) {
            console.log("Hit"); //used for debugging
            this.score+=1;
            this.timer = this.max_spawn_timer;
        } else { //otherwise there is no real solution and the player missed
            console.log("Missed"); //used for debugging
            this.miss+=1;
            const bullet_intersection_point = this.calculateBulletMark();
            if (bullet_intersection_point) {
                this.bullet_marks.push(bullet_intersection_point);
            }
        }
    }   

    calculateBulletMark() {
        const wall_width = 100;  // Half the width of the wall (100 / 2)
        const wall_height = 25; // Half the height of the wall (50 / 2)
        const floor_ceiling_size = 100; // Half the size of the floor and ceiling (100 / 2)
    
        const walls = [
            { normal: vec3(0, 0, 1), point: vec3(0, 0, -100) }, // front wall
            { normal: vec3(1, 0, 0), point: vec3(-100, 0, 0) }, // left wall
            { normal: vec3(-1, 0, 0), point: vec3(100, 0, 0) }, // right wall
            { normal: vec3(0, 0, -1), point: vec3(0, 0, 100) }, // back wall
            { normal: vec3(0, 1, 0), point: vec3(0, -25, 0) }, // floor
            { normal: vec3(0, -1, 0), point: vec3(0, 25, 0) }  // ceiling
        ];
    
        for (let wall of walls) {
            const denom = wall.normal.dot(this.look_direction);
            if (Math.abs(denom) > 0.0001) {
                const t = wall.point.minus(this.eye).dot(wall.normal) / denom;
                if (t >= 0) {
                    const intersection_point = this.eye.plus(this.look_direction.times(t));
                    const local_point = intersection_point.minus(wall.point);
    
                    // Check if the intersection_point is within the bounds of the wall
                    if (wall.normal.equals(vec3(0, 0, 1)) || wall.normal.equals(vec3(0, 0, -1))) {
                        // Front and back walls (check x and y)
                        if (Math.abs(local_point[0]) <= wall_width && Math.abs(local_point[1]) <= wall_height) {
                            return { position: intersection_point, normal: wall.normal };
                        }
                    } else if (wall.normal.equals(vec3(1, 0, 0)) || wall.normal.equals(vec3(-1, 0, 0))) {
                        // Left and right walls (check y and z)
                        if (Math.abs(local_point[1]) <= wall_height && Math.abs(local_point[2]) <= wall_width) {
                            return { position: intersection_point, normal: wall.normal };
                        }
                    } else if (wall.normal.equals(vec3(0, 1, 0)) || wall.normal.equals(vec3(0, -1, 0))) {
                        // Floor and ceiling (check x and z)
                        if (Math.abs(local_point[0]) <= floor_ceiling_size && Math.abs(local_point[2]) <= floor_ceiling_size) {
                            return { position: intersection_point, normal: wall.normal };
                        }
                    }
                }
            }
        }
        return null;
    }

    onMouseMove(e) {
        if(!this.pause_flag &&!this.game_end_flag){
            this.yaw -= e.movementX * this.sensitivity;
            this.pitch -= e.movementY * this.sensitivity; // Inverting y-axis movement for more natural control

            // Clamp the pitch
            const maxPitch = Math.PI / 2 - 0.01;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

            this.updateViewMatrix();
        }
    }

    drawCrosshair(context, program_state) {
        let crosshair_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                .times(Mat4.rotation(-this.pitch,1,0,0))
                                                .times(Mat4.scale(0.02,0.02,0.02))
                                                .times(Mat4.translation(0,0,0));
        this.shapes.bullet.draw(context,program_state,crosshair_transform,this.materials.crosshair_texture);
    }


    drawBulletMarks(context, program_state){
        // Render bullet marks
        for (let mark of this.bullet_marks) {
            let mark_transform = Mat4.identity().times(Mat4.translation(...mark.position.plus(mark.normal.times(0.1))));
            
            //The following if statements rotate the bullet_hole properly so that it is normal to the surface it lies on
            if (mark.normal.equals(vec3(0, 0, 1))) {
                mark_transform = mark_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
            } else if (mark.normal.equals(vec3(1, 0, 0))) {
                mark_transform = mark_transform.times(Mat4.rotation(-Math.PI / 2, 0, 1, 0));
            } else if (mark.normal.equals(vec3(-1, 0, 0))) {
                mark_transform = mark_transform.times(Mat4.rotation(Math.PI / 2, 0, 1, 0));
            } else if (mark.normal.equals(vec3(0, 0, -1))) {
                // no additional rotation needed
            } else if (mark.normal.equals(vec3(0,1,0))){
                mark_transform = mark_transform.times(Mat4.rotation(Math.PI/2,1,0,0));
            } else if (mark.normal.equals(vec3(0,-1,0))){
                mark_transform = mark_transform.times(Mat4.rotation(-Math.PI/2,1,0,0));
            }
            mark_transform = mark_transform.times(Mat4.scale(2,2,2));
            this.shapes.bullet.draw(context, program_state, mark_transform, this.materials.bullet_hole);
            console.log("Mark Position:", mark.position);
        } 
    }

    drawTextOverlays(context, program_state) {
        let score_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0)) //rotate with camera movement
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.scale(-0.03,0.03,0.03))
                                            .times(Mat4.translation(-24,12,2));
                                            
        this.shapes.text.set_string("Score:" + this.score, context.context);
        this.shapes.text.draw(context,program_state,score_transform, this.materials.text_image.override({color:hex_color("#319905")}));

        let miss_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0)) //rotate with camera movement
                                            .times(Mat4.rotation(-this.pitch,1,0,0)) 
                                            .times(Mat4.scale(-0.03,0.03,0.03))
                                            .times(Mat4.translation(-24,10,2));
        this.shapes.text.set_string("Misses:"+this.miss, context.context);
        this.shapes.text.draw(context,program_state,miss_transform,this.materials.text_image.override({color:hex_color("#990505")}));

        let timer_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.scale(-0.03,0.03,0.03))
                                            .times(Mat4.translation(11,12,2));
        this.shapes.text.set_string("Timer:" + ((this.max_game_time-this.game_timer)/100), context.context);
        this.shapes.text.draw(context, program_state,timer_transform, this.materials.text_image);

        let pause_icon_transform = timer_transform.times(Mat4.translation(0,-2,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.shapes.text.set_string("Press Space to Pause", context.context);
        this.shapes.text.draw(context,program_state,pause_icon_transform, this.materials.text_image);
    }

    gameTimeControl()
    {
        if(this.game_timer>this.max_game_time){
            this.game_end_flag=true;
            this.game_timer=0;
        }
        else{
            this.game_timer++;
        }
        
        
    }

    drawStartScreen(context,program_state){
        let title_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.scale(-0.06,0.06,0.06))
                                            .times(Mat4.translation(-7,3,2));
        this.shapes.text.set_string("Laser Focus", context.context);
        this.shapes.text.draw(context,program_state,title_transform,this.materials.text_image.override({color:hex_color("#e60eb0")}));

        let click_display_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                    .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                    .times(Mat4.rotation(-this.pitch,1,0,0))
                                                    .times(Mat4.scale(-0.03,0.03,0.03))
                                                    .times(Mat4.translation(-13,-4,2));
        this.shapes.text.set_string("Press Space to Begin", context.context);
        this.shapes.text.draw(context,program_state,click_display_transform,this.materials.text_image);

        let background_transform = Mat4.identity().times(Mat4.translation(0,0,80)).times(Mat4.scale(100,100,100));
        this.shapes.background.draw(context,program_state,background_transform,this.materials.background);
    }

    drawPauseScreen(context, program_state){
        let pause_text_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                .times(Mat4.rotation(-this.pitch,1,0,0))
                                                .times(Mat4.scale(-0.03,0.03,0.03))
                                                .times(Mat4.translation(-7,10,2));
        this.shapes.text.set_string("Game Paused", context.context);
        this.shapes.text.draw(context,program_state,pause_text_transform,this.materials.text_image);

        let prompt_text_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                .times(Mat4.rotation(-this.pitch,1,0,0))
                                                .times(Mat4.scale(-0.03,0.03,0.03))
                                                .times(Mat4.translation(-17  ,-4,2));
        this.shapes.text.set_string("Press Space to Continue ", context.context);
        this.shapes.text.draw(context,program_state,prompt_text_transform,this.materials.text_image);

        let pause_icon_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                .times(Mat4.rotation(-this.pitch,1,0,0))
                                                .times(Mat4.scale(0.02 ,0.06 ,1))
                                                .times(Mat4.translation(2,1 ,0));
        this.shapes.wall.draw(context,program_state,pause_icon_transform,this.materials.wall_material);
        pause_icon_transform = pause_icon_transform.times(Mat4.translation(-4,0,0));
        this.shapes.wall.draw(context,program_state,pause_icon_transform,this.materials.wall_material);
    }

    drawEndScreen(context,program_state)
    {
        let end_text_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.scale(-0.03,0.03,0.03))
                                            .times(Mat4.translation(-7,10,2));
        this.shapes.text.set_string("Time's Up!", context.context);
        this.shapes.text.draw(context,program_state,end_text_transform,this.materials.text_image);

        let score_display_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                    .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                    .times(Mat4.rotation(-this.pitch,1,0,0))
                                                    .times(Mat4.scale(-0.03,0.03,0.03))
                                                    .times(Mat4.translation(-9,6,2));
        this.shapes.text.set_string("Final Score:" + this.score, context.context);
        this.shapes.text.draw(context,program_state,score_display_transform,this.materials.text_image.override({color:hex_color("#319905")}));

        let miss_display_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                    .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                    .times(Mat4.rotation(-this.pitch,1,0,0))
                                                    .times(Mat4.scale(-0.03,0.03,0.03))
                                                    .times(Mat4.translation(-13,3,2));
        this.shapes.text.set_string("You missed " + this.miss + " times.", context.context);
        this.shapes.text.draw(context,program_state,miss_display_transform,this.materials.text_image.override({color:hex_color("#990505")}));

        let prompt_text_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                .times(Mat4.rotation(-this.pitch,1,0,0))
                                                .times(Mat4.scale(-0.03,0.03,0.03))
                                                .times(Mat4.translation(-17  ,-4,2));
        this.shapes.text.set_string("Press Space to Play Again", context.context);
        this.shapes.text.draw(context,program_state,prompt_text_transform,this.materials.text_image);
    }

    drawRoom(context, program_state){
        const room_size = 100;

        // FRONT WALL
        let front_wall_transform = Mat4.translation(0, 0, - room_size).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, front_wall_transform, this.materials.wall_texture);

        // LEFT WALL
        let left_wall_transform = Mat4.translation(-room_size, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, left_wall_transform, this.materials.wall_texture);

        // RIGHT WALL
        let right_wall_transform = Mat4.translation(room_size, 0, 0).times(Mat4.rotation(Math.PI / 2, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, right_wall_transform, this.materials.wall_texture);

        // BACK WALL
        let back_wall_transform = Mat4.translation(0, 0, room_size).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.wall.draw(context, program_state, back_wall_transform, this.materials.wall_texture);

        // FLOOR
        let floor_transform = Mat4.translation(0, -25, 0).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.floor_texture);

        // ROOF
        let roof_transform = Mat4.translation(0, 25, 0).times(Mat4.rotation(Math.PI / 2, 1, 0, 0)).times(Mat4.scale(room_size, room_size, 1));
        this.shapes.floor.draw(context, program_state, roof_transform, this.materials.floor_texture);
    }

    draw_medium_gun(context, program_state) {

        const x_pos = 0;
        const y_pos = 0;
        const z_pos = 0;

        // gun barrel
        const barrel_length = 7;
        const barrel_height = barrel_length * 0.1;
        const barrel_width = barrel_height;
        let barrel_transform = Mat4.identity();
        barrel_transform = barrel_transform.times(Mat4.translation(this.eye[0],this.eye[1],this.eye[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.translation(-5.5,-3,16 ))
                                            .times(Mat4.rotation(Math.PI/2,0,1,0));
        barrel_transform = barrel_transform.times(Mat4.translation(x_pos, y_pos, z_pos)).times(Mat4.scale(barrel_length, barrel_height, barrel_width));
        this.shapes.cube.draw(context, program_state, barrel_transform, this.materials.gun_barrel);

        // gun under-barrel ( 2 parts )
        let under_barrel_transform = barrel_transform.times(Mat4.translation(0.25, 1.5, 0)).times(Mat4.scale(0.3, 0.5, 0.75));
        this.shapes.cube.draw(context, program_state, under_barrel_transform, this.materials.gun_barrel_ring);

        under_barrel_transform = under_barrel_transform.times(Mat4.translation(0, -6, 0));
        this.shapes.cube.draw(context, program_state, under_barrel_transform, this.materials.gun_barrel_ring);

        // gun grip
        let grip_transform = barrel_transform.times(Mat4.translation(0.4, -3, 0)).times(Mat4.scale(0.05, 1, 0.5));
        this.shapes.cube.draw(context, program_state, grip_transform, this.materials.gun_barrel);

        // gun buttstock ( 3 parts )
        let buttstock_transform = barrel_transform.times(Mat4.translation(0.7, -2, 0)).times(Mat4.scale(0.05, 1, 0.5));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.gun_barrel);

        buttstock_transform = buttstock_transform.times(Mat4.translation(5, 0, 0));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.gun_barrel);

        buttstock_transform = buttstock_transform.times(Mat4.translation(-2, -0.5, 0)).times(Mat4.scale(2, 0.5, 1));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.gun_barrel);

        // gun barrel rings
        let ring_transform = barrel_transform.times(Mat4.translation(-0.45, 0, 0)).times(Mat4.scale(0.05, 1.5, 1.5));
        this.shapes.cube.draw(context, program_state, ring_transform, this.materials.gun_barrel_ring);

        ring_transform = ring_transform.times(Mat4.translation(-4, 0, 0));
        this.shapes.cube.draw(context, program_state, ring_transform, this.materials.gun_barrel_ring);

        ring_transform = ring_transform.times(Mat4.translation(-4, 0, 0));
        this.shapes.cube.draw(context, program_state, ring_transform, this.materials.gun_barrel_ring);

        // gun muzzle
        let muzzle_transform = barrel_transform.times(Mat4.translation(-1.025, 0, 0)).times(Mat4.scale(0.025, 0.5, 0.5));
        this.shapes.cube.draw(context, program_state, muzzle_transform, this.materials.gun_barrel_ring);

    }

    draw_small_gun(context, program_state) {

        const x_pos = 0;
        const y_pos = 0;
        const z_pos = 0;

        // gun barrel
        const barrel_length = 3;
        const barrel_height = barrel_length * 0.25;
        const barrel_width = barrel_height;
        let barrel_transform = Mat4.identity();
        barrel_transform = barrel_transform.times(Mat4.translation(this.eye[0],this.eye[1],this.eye[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.translation(-5.5,-3,14))
                                            .times(Mat4.rotation(Math.PI/2,0,1,0));
        barrel_transform = barrel_transform.times(Mat4.translation(x_pos, y_pos, z_pos)).times(Mat4.scale(barrel_length, barrel_height, barrel_width));
        this.shapes.cube.draw(context, program_state, barrel_transform, this.materials.gun_barrel);

        // gun grip
        let grip_transform = barrel_transform.times(Mat4.translation(0.7, -2.5, 0)).times(Mat4.scale(0.25, 1.5, 1));
        this.shapes.cube.draw(context, program_state, grip_transform, this.materials.gun_barrel);

        // gun trigger ( 2 parts )
        let trigger_transform = barrel_transform.times(Mat4.translation(0.15, -1.75, 0)).times(Mat4.scale(0.1, 0.75, 0.5));
        this.shapes.cube.draw(context, program_state, trigger_transform, this.materials.gun_barrel_ring);

        trigger_transform = barrel_transform.times(Mat4.translation(0.35, -2.2, 0)).times(Mat4.scale(0.1, 0.3, 0.5));
        this.shapes.cube.draw(context, program_state, trigger_transform, this.materials.gun_barrel_ring);

        // gun muzzle
        let muzzle_transform = barrel_transform.times(Mat4.translation(-1.1, 0, 0)).times(Mat4.scale(0.05, 0.5, 0.5));
        this.shapes.cube.draw(context, program_state, muzzle_transform, this.materials.gun_barrel_ring);

    }


    display(context, program_state) {
        program_state.set_camera(this.View_Matrix);
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);

        let model_transform = Mat4.identity();
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        //const t = program_state.animation_time / 1000;

        if(!this.start_flag){
            this.drawRoom(context,program_state); 
        }
        
        

        if(!this.game_end_flag && !this.start_flag){
            if(this.timer<this.reset_spawn_timer){
                
                this.shapes.target.draw(context,program_state,this.target_transform,this.materials.target_texture);
                
            }
            if(this.timer>this.max_spawn_timer) 
            {
                this.timer = 0;
                this.index = this.getRandIndex();
                this.updateTargetPosition();
            }
        }   
        
        if(this.start_flag){ //case it is start screen
            this.drawStartScreen(context,program_state);
        }
        else{
            if(this.game_end_flag) //case the game is over
            {
                this.drawEndScreen(context,program_state);
                this.bullet_marks = [];
                document.exitPointerLock();
            }
            else if(!this.pause_flag){ //case that the game is running
                this.timer++;
                this.drawCrosshair(context, program_state);
                this.draw_small_gun(context,program_state);
                //this.draw_medium_gun(context,program_state);
                this.drawTextOverlays(context,program_state);
                this.drawBulletMarks(context,program_state);
                this.gameTimeControl();
            }
            else{ //case that it is paused
                this.drawTextOverlays(context,program_state);
                this.drawPauseScreen(context,program_state);
            }
        }
        
    }

}

