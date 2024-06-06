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
             gun_barrel: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/barrel2.png")}),
            gun_barrel_ring: new Material(new defs.Textured_Phong  (),
                {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/barrelTexture.png")}), 
            black: new Material(new defs.Textured_Phong(), {
                color: hex_color("#000000")
            }),
            Pistol: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/barrel1.png")}),
            Sniper: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/barrel3.png")}),
            Color: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/Color.png")}),
            Muzzle1: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/muzzle1.png")}),
            Muzzle2: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/muzzle2.png")}),
            Muzzle3: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/muzzle3.png")}),
            Extension: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/extension.png")}),
            Scope: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/scope.png")}),
            Scope2: new Material(new defs.Textured_Phong(), 
            {ambient: 1, diffusivity: 0, color: hex_color("#000000"), texture: new Texture("assets/scope2.png")})
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
        this.yaw = 0;
        this.pitch = 0;
        this.sensitivity = 0.001;

        
        this.game_timer=0;
        this.game_end_flag = false;
        this.max_game_time = 3000;

        this.game_live_flag = false;

        this.start_flag = true;
        this.pause_flag = false;

        this.gun_select_flag = false;
        this.gun_small_flag = false;
        this.gun_medium_flag = false;
        this.gun_large_flag = false;


        this.target_num = 10;
        this.target_info = [];
        this.target_speed = 0.3;
        for(let i = 0; i<this.target_num; i++){
            const x = this.getRandValue(-this.target_speed,this.target_speed);
            const y = this.getRandValue(-this.target_speed,this.target_speed);
            const z = this.getRandValue(-this.target_speed,this.target_speed);
            this.target_info.push({
                timer: 0, 
                reset_spawn_timer: this.max_game_time,
                max_spawn_timer: this.max_game_time,
                index: this.getRandIndex(),
                transform: Mat4.identity(),
                velocity: [x,y,z],
                i: i,
            })
            this.updateTargetPosition(i);
        }
        
        

        


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
            case " ": 
                if(this.start_flag){ //if on start screen
                    this.gun_select_flag = true;
                    this.start_flag = false;
                }
                else if(this.game_live_flag){ //if game live
                    //should pause
                    this.game_live_flag = false;
                    this.pause_flag = true;
                    document.exitPointerLock();
                }
                else if(this.pause_flag){ //if game is paused
                    //should unpause
                    this.pause_flag = false;
                    this.game_live_flag=true;
                    document.body.requestPointerLock();
                }
                else if(this.game_end_flag){ //if game is over
                    //should start game over 
                    this.game_end_flag = false;
                    this.game_live_flag = true;
                    this.score = 0;
                    this.miss = 0;
                    this.game_timer = 0;
                    for(let target of this.target_info){
                        target.timer = 0;
                    }
                    document.body.requestPointerLock();
                }
                break;
            case "1":
                if(this.gun_select_flag){
                    this.gun_select_flag = false;
                    this.gun_large_flag = false;
                    this.gun_medium_flag = false;
                    this.gun_small_flag=true;
                    this.game_live_flag = true;
                    document.body.requestPointerLock();
                }
            case "2":
                if(this.gun_select_flag){
                    this.gun_select_flag = false;
                    this.gun_large_flag = false;
                    this.gun_medium_flag = true;
                    this.gun_small_flag=false;
                    this.game_live_flag = true;
                    document.body.requestPointerLock();
                }
            case "3":
                if(this.gun_select_flag){
                    this.gun_select_flag = false;
                    this.gun_large_flag = true;
                    this.gun_medium_flag = false;
                    this.gun_small_flag=false;
                    this.game_live_flag = true;
                    document.body.requestPointerLock();
                }
            case "g":
                if(this.game_end_flag){
                    this.game_end_flag = false;
                    this.gun_select_flag=true;
                     
                }
        }
        
        // Collision detection with walls
        const roomSize = 100;
        if(this.game_live_flag){
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

    getRandValue(min, max){
        return Math.random() * (max - min) + min;
    }

    updateTargetPosition(i)
    {
        this.target_info[i].transform = Mat4.translation(...this.sphere_positions[this.target_info[i].index]).times(Mat4.translation(-15,-15,0)).times(Mat4.scale(3,3,3));
    }

    resetViewMatrix(){
        this.eye = vec3(0, 0, -30); 
        this.at = (1,0,0); 
        this.pitch = 0;
        this.yaw = 0; 
        this.updateViewMatrix();
        // this.updateViewMatrix();
        
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
        const ray_direction = this.look_direction;
        let hit_flag = false;
        for(let target of this.target_info){
            // Extract the sphere's position from the target transform
            const sphere_center = target.transform.times(vec4(0,0,0,1)).to3();
        
        
            // Vector from ray origin to sphere center
            const oc = sphere_center.minus(this.eye);
            
            // Coefficients for the quadratic equation
            const a = ray_direction.dot(ray_direction);
            const b = 2.0 * oc.dot(ray_direction);
            const c = oc.dot(oc) - radius * radius;
            
            // Calculate the discriminant
            const discriminant = b * b - 4 * a * c;
            
            //if the discriminant >0, then there exists a real solution for the intersection between the ray and the sphere
            if (discriminant >= 0) {  //hit
                this.score+=1;
                hit_flag = true;
                target.timer = target.max_spawn_timer;
            }   
        } 
        if(!hit_flag){
            //miss
            this.miss+=1;
            const bullet_intersection_point = this.calculateBulletMark();
            if (bullet_intersection_point) {
                this.bullet_marks.push(bullet_intersection_point);
            }
        }
    }
        
        

    calculateBulletMark() {
        const wall_width = 100;  //The width of the wall
        const wall_height = 25; // Half the height of the wall (50 / 2)
        const floor_ceiling_size = 100; // size of the floor and ceiling
    
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
        if(this.game_live_flag){
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
                                            .times(Mat4.translation(10,12,2));
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
            this.game_live_flag=false;
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

        let gun_prompt_transform = prompt_text_transform.times(Mat4.translation(-2 ,-3,0));
        this.shapes.text.set_string("Press G to choose new weapon", context.context);
        this.shapes.text.draw(context,program_state,gun_prompt_transform,this.materials.text_image);
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

    draw_large_gun(context, program_state, t) { 

        const x_pos = 0;
        const y_pos = 0;
        const z_pos = 0;

        // gun barrel ( 4 parts )
        const barrel_length = 8 ;
        const barrel_height = barrel_length * 0.025;
        const barrel_width = barrel_height;
        let barrel_transform = Mat4.identity();

        if(this.gun_select_flag){
            barrel_transform = barrel_transform.times(Mat4.translation(-15 ,0,0))
                                                .times(Mat4.translation(0,Math.cos(Math.PI * t), 0))
                                                .times(Mat4.rotation(-Math.PI/4, 0, 0 , 1))
                                                .times(Mat4.rotation(t * 1/4 * Math.PI,1,0,0)); 
        } else{
            barrel_transform = barrel_transform.times(Mat4.translation(this.eye[0],this.eye[1],this.eye[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.translation(-5.5,-3,16))
                                            
                                            .times(Mat4.translation((1/16 )*Math.sin(Math.PI/2*t ),(1/8)* Math.cos(Math.PI/2  * t),0 )) //adds some sway to the gun 
                                            .times(Mat4.rotation(Math.PI/2,0,1,0)); 
                                            console.log("here");
        } 

        barrel_transform = barrel_transform.times(Mat4.translation(x_pos, y_pos, z_pos)).times(Mat4.scale(barrel_length, barrel_height, barrel_width));
        this.shapes.cube.draw(context, program_state, barrel_transform, this.materials.Extension);

        let barrel_transform_2 = barrel_transform.times(Mat4.translation(0.2, 3, 0)).times(Mat4.scale(0.3, 2, 2));
        this.shapes.cube.draw(context, program_state, barrel_transform_2, this.materials.Sniper);

        let barrel_transform_3 = barrel_transform.times(Mat4.translation(0.7, 2, 0)).times(Mat4.scale(0.2, 1, 1));
        this.shapes.cube.draw(context, program_state, barrel_transform_3, this.materials.Sniper);

        let barrel_transform_4 = barrel_transform.times(Mat4.translation(0.3, -2.5, 0)).times(Mat4.scale(0.35, 1.5, 1));
        this.shapes.cube.draw(context, program_state, barrel_transform_4, this.materials.black);

        let barrel_transform_5 = barrel_transform.times(Mat4.translation(0.25, 0, 0)).times(Mat4.scale(0.5, 1.5, 1.5));
        this.shapes.cube.draw(context, program_state, barrel_transform_5, this.materials.Sniper);


        // scope
        let scope_transform = barrel_transform.times(Mat4.translation(0.35, 5.5, 0)).times(Mat4.scale(0.05, 0.5, 0.75));
        this.shapes.cube.draw(context, program_state, scope_transform, this.materials.black);

        let scope_transform_2 = barrel_transform.times(Mat4.translation(0.3, 7, 0)).times(Mat4.scale(0.15, 1, 1.5));
        this.shapes.cube.draw(context, program_state, scope_transform_2, this.materials.Scope2);

        // muzzle
        let muzzle_transform = barrel_transform.times(Mat4.translation(-1.1, 0, 0)).times(Mat4.scale(0.1, 2, 2));
        this.shapes.cube.draw(context, program_state, muzzle_transform, this.materials.Muzzle3);

        // buttstock ( 3 parts )
        let buttstock_transform = barrel_transform.times(Mat4.translation(0.65, -3, 0)).times(Mat4.scale(0.02, 2, 1));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.black);

        let buttstock_transform_2 = barrel_transform.times(Mat4.translation(0.9, -3, 0)).times(Mat4.scale(0.02, 2, 1));
        this.shapes.cube.draw(context, program_state, buttstock_transform_2, this.materials.black);

        let buttstock_transform_3 = barrel_transform.times(Mat4.translation(0.76, -4, 0)).times(Mat4.scale(0.125, 1, 1));
        this.shapes.cube.draw(context, program_state, buttstock_transform_3, this.materials.black);

        // clip
        let clip_transform = barrel_transform.times(Mat4.translation(0.5, -6, 0)).times(Mat4.scale(0.05, 2, 1));
        this.shapes.cube.draw(context, program_state, clip_transform, this.materials.Scope2);
    }

    draw_medium_gun(context, program_state, t) {

        const x_pos = 0;
        const y_pos = 0;
        const z_pos = 0;

        // gun barrel
        const barrel_length = 7;
        const barrel_height = barrel_length * 0.1;
        const barrel_width = barrel_height;
        let barrel_transform = Mat4.identity();
        if(this.gun_select_flag){
            barrel_transform = barrel_transform.times(Mat4.translation(0,Math.cos(Math.PI * t), 0))
                                                .times(Mat4.rotation(-Math.PI/4, 0, 0 , 1))
                                                .times(Mat4.rotation(t * 1/4 * Math.PI,1,0,0)); 
        } else{
            barrel_transform = barrel_transform.times(Mat4.translation(this.eye[0],this.eye[1],this.eye[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.translation(-5.5,-3,16 ))
                                            .times(Mat4.translation((1/16 )*Math.sin(Math.PI/2*t ),(1/8)* Math.cos(Math.PI/2  * t),0 )) //adds some sway to the gun 
                                            .times(Mat4.rotation(Math.PI/2,0,1,0)); 
        }
        
        barrel_transform = barrel_transform.times(Mat4.translation(x_pos, y_pos, z_pos)).times(Mat4.scale(barrel_length, barrel_height, barrel_width));
        this.shapes.cube.draw(context, program_state, barrel_transform, this.materials.gun_barrel);

        // gun under-barrel ( 2 parts )
        let under_barrel_transform = barrel_transform.times(Mat4.translation(0.25, 1.5, 0)).times(Mat4.scale(0.3, 0.5, 0.75));
        this.shapes.cube.draw(context, program_state, under_barrel_transform, this.materials.Scope);

        under_barrel_transform = under_barrel_transform.times(Mat4.translation(0, -6, 0));
        this.shapes.cube.draw(context, program_state, under_barrel_transform, this.materials.gun_barrel_ring.override(new Texture("assets/Color.png")));

        // gun grip
        let grip_transform = barrel_transform.times(Mat4.translation(0.4, -3, 0)).times(Mat4.scale(0.05, 1, 0.5));
        this.shapes.cube.draw(context, program_state, grip_transform, this.materials.black);

        // gun buttstock ( 3 parts ) 
        let buttstock_transform = barrel_transform.times(Mat4.translation(0.7, -2, 0)).times(Mat4.scale(0.05, 1, 0.5));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.black);

        buttstock_transform = buttstock_transform.times(Mat4.translation(5, 0, 0));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.black);
 
        buttstock_transform = buttstock_transform.times(Mat4.translation(-2, -0.5, 0)).times(Mat4.scale(2, 0.5, 1));
        this.shapes.cube.draw(context, program_state, buttstock_transform, this.materials.black);

        // gun barrel rings
        let ring_transform = barrel_transform.times(Mat4.translation(-0.45, 0, 0)).times(Mat4.scale(0.05, 1.5, 1.5));
        this.shapes.cube.draw(context, program_state, ring_transform, this.materials.Color);

        ring_transform = ring_transform.times(Mat4.translation(-4, 0, 0));
        this.shapes.cube.draw(context, program_state, ring_transform, this.materials.Color);

        ring_transform = ring_transform.times(Mat4.translation(-4, 0, 0));
        this.shapes.cube.draw(context, program_state, ring_transform, this.materials.Color);

        // gun muzzle
        let muzzle_transform = barrel_transform.times(Mat4.translation(-1.025, 0, 0)).times(Mat4.scale(0.025, 0.5, 0.5));
        this.shapes.cube.draw(context, program_state, muzzle_transform, this.materials.Muzzle2);

    }

    draw_small_gun(context, program_state, t) {
        const x_pos = 0;
        const y_pos = 0;
        const z_pos = 0;

        // gun barrel
        const barrel_length = 3;
        const barrel_height = barrel_length * 0.25;
        const barrel_width = barrel_height;
        let barrel_transform = Mat4.identity();
        if(this.gun_select_flag){
            barrel_transform = barrel_transform.times(Mat4.translation(15,0,0))
                                                .times(Mat4.translation(0,Math.cos(Math.PI * t),0))
                                                .times(Mat4.rotation(-Math.PI/4, 0, 0,1))
                                                .times(Mat4.rotation(t * 1/4 * Math.PI,1,0,0));
        }else{ 
            barrel_transform = barrel_transform.times(Mat4.translation(this.eye[0],this.eye[1],this.eye[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.translation(-5.5,-3,14))
                                            .times(Mat4.translation((1/16 )*Math.sin(Math.PI/2*t ),(1/8)* Math.cos(Math.PI/2  * t),0 )) //adds some sway to the gun
                                            .times(Mat4.rotation(Math.PI/2,0,1,0));
        }
        
        barrel_transform = barrel_transform.times(Mat4.translation(x_pos, y_pos, z_pos)).times(Mat4.scale(barrel_length, barrel_height, barrel_width));
        this.shapes.cube.draw(context, program_state, barrel_transform, this.materials.Pistol);

        // gun grip
        let grip_transform = barrel_transform.times(Mat4.translation(0.7, -2.5, 0)).times(Mat4.scale(0.25, 1.5, 1));
        this.shapes.cube.draw(context, program_state, grip_transform, this.materials.black);

        // gun trigger ( 2 parts )
        let trigger_transform = barrel_transform.times(Mat4.translation(0.15, -1.75, 0)).times(Mat4.scale(0.1, 0.75, 0.5));
        this.shapes.cube.draw(context, program_state, trigger_transform, this.materials.Muzzle1);

        trigger_transform = barrel_transform.times(Mat4.translation(0.35, -2.2, 0)).times(Mat4.scale(0.1, 0.3, 0.5));
        this.shapes.cube.draw(context, program_state, trigger_transform, this.materials.Muzzle1);

        // gun muzzle
        let muzzle_transform = barrel_transform.times(Mat4.translation(-1.1, 0, 0)).times(Mat4.scale(0.05, 0.5, 0.5));
        this.shapes.cube.draw(context, program_state, muzzle_transform, this.materials.Muzzle1);

    }

    drawGunSelect(context,program_state, t){
        this.draw_small_gun(context,program_state, t);
        this.draw_medium_gun(context,program_state, t);
        this.draw_large_gun(context,program_state,t);

        
        let instructions_text_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                            .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                            .times(Mat4.rotation(-this.pitch,1,0,0))
                                            .times(Mat4.scale(-0.03,0.03,0.03))
                                            .times(Mat4.translation(-13 ,12 ,2));
        this.shapes.text.set_string("Choose your weapon!", context.context);
        this.shapes.text.draw(context,program_state,instructions_text_transform,this.materials.text_image);

        let instructions2_text_transform = instructions_text_transform.times(Mat4.translation(1 ,-3,0)).times(Mat4.scale(0.5,0.5,0.5 ));
        this.shapes.text.set_string("Game begins once weapon is chosen.", context.context);
        this.shapes.text.draw(context,program_state,instructions2_text_transform,this.materials.text_image); 

        let choose_small_gun_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                        .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                        .times(Mat4.rotation(-this.pitch,1,0,0))
                                                        .times(Mat4.scale(-0.03,0.03,0.03))
                                                        .times(Mat4.translation(-23,-10,2));
        this.shapes.text.set_string("Pistol", context.context);
        this.shapes.text.draw(context,program_state,choose_small_gun_transform,this.materials.text_image);

        let choose_medium_gun_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                        .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                        .times(Mat4.rotation(-this.pitch,1,0,0))
                                                        .times(Mat4.scale(-0.03,0.03,0.03))
                                                        .times(Mat4.translation(-6,-10,2));
        this.shapes.text.set_string("Laser-Gun", context.context);
        this.shapes.text.draw(context,program_state,choose_medium_gun_transform,this.materials.text_image);

        let choose_large_gun_transform = Mat4.identity().times(Mat4.translation(this.at[0],this.at[1],this.at[2]))
                                                        .times(Mat4.rotation(this.yaw, 0, 1, 0))
                                                        .times(Mat4.rotation(-this.pitch,1,0,0))
                                                        .times(Mat4.scale(-0.03,0.03,0.03))
                                                        .times(Mat4.translation(14,-10,2));
        this.shapes.text.set_string("Sniper", context.context);
        this.shapes.text.draw(context,program_state,choose_large_gun_transform,this.materials.text_image);

        let one_transform = choose_small_gun_transform.times(Mat4.translation(1.5 ,-2,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.shapes.text.set_string("Press 1",context.context);
        this.shapes.text.draw(context,program_state,one_transform,this.materials.text_image);

        let two_transform = choose_medium_gun_transform.times(Mat4.translation(3 ,-2,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.shapes.text.set_string("Press 2",context.context);
        this.shapes.text.draw(context,program_state,two_transform,this.materials.text_image);

        let three_transform = choose_large_gun_transform.times(Mat4.translation(1.5 ,-2,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.shapes.text.set_string("Press 3",context.context);
        this.shapes.text.draw(context,program_state,three_transform,this.materials.text_image);
    }


    drawTargets(context,program_state, i){
        const wall_width = 100;  //The width of the wall
        const wall_height = 25; // Half the height of the wall (50 / 2)
        const floor_ceiling_size = 100; // size of the floor and ceiling
        
        let target_position = this.target_info[i].transform.times(vec4(0,0,0,1)).to3();

        // Apply the updated position to the target transform
        
        //border collision:
        if(target_position[0]+3>=100 || target_position[0]-3<=-100){
            this.target_info[i].velocity[0] *= -1;
        }
        if(target_position[1]+3>=25 || target_position[1]-3 <=-25){
            this.target_info[i].velocity[1] *= -1;
        }
        if(target_position[2]-3>=50|| target_position[2]+3<-50){
            this.target_info[i].velocity[2]*= -1;
        } 
        
        
        this.target_info[i].transform = this.target_info[i].transform.times(Mat4.translation(...this.target_info[i].velocity));
        
        this.shapes.target.draw(context,program_state,this.target_info[i].transform,this.materials.target_texture);
    }

    checkTargetCollision(i){ 
        //this function checks if the targets collide with one another. 
        //If they do collide, it will calculate their new velocities using techniques from ellastic collisions in physics.

        let target1 = this.target_info[i];
        let target1_position = target1.transform.times(vec4(0,0,0,1)).to3();

        for(let target2 of this.target_info){
            if(target2.i == i){
                continue;
            }
            let target2_position = target2.transform.times(vec4(0,0,0,1)).to3();
            let distVec = target1_position.minus(target2_position);
            let dist = distVec.norm();


            // Check if the distance is less than the sum of the radii (6)
            if (dist < 6) {
                // Normalize the distance vector to get the normal
                let normal = distVec.normalized();

                let relativeVelocity = vec3(...target1.velocity).minus(vec3(...target2.velocity));
                let velocityAlongNormal = relativeVelocity.dot(normal);

                // Swap the velocity components along the normal
                for (let k = 0; k < 3; k++) {
                    let momentum_change = velocityAlongNormal * normal[k];
                    target1.velocity[k] -= momentum_change;
                    target2.velocity[k] += momentum_change;
                }
            }
        }
    }

    display(context, program_state) {
        program_state.set_camera(this.View_Matrix);
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.1, 1000);

        let model_transform = Mat4.identity();
        const light_position = vec4(0, 0, 0, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        
        const t = program_state.animation_time / 1000;
        const dt = program_state.animation_delta_time/1000;
        

        if(this.game_live_flag){
            for(let target of this.target_info){
                if(target.timer<target.reset_spawn_timer){
                    this.checkTargetCollision(target.i);
                    this.drawTargets(context,program_state, target.i);
                }
                if(target.timer>target.max_spawn_timer) 
                {
                    target.timer = 0;
                    target.index = this.getRandIndex();
                    this.updateTargetPosition(target.i);
                }
            }
            
            
        }   
        
        if(this.start_flag){ //start screen
            this.drawStartScreen(context,program_state);
        }
        else{
            this.drawRoom(context,program_state);
        }
        if(this.gun_select_flag){ //if in gun select  
            this.resetViewMatrix(); 
            this.score =0;
            this.miss=0;
            this.drawGunSelect(context,program_state, t);
        }
        else if(this.pause_flag){ //if on pause screen
            this.drawTextOverlays(context,program_state);
            this.drawPauseScreen(context,program_state);
        }
        else if(this.game_end_flag){ //game is over
            this.drawEndScreen(context,program_state);
            this.bullet_marks = [];
            document.exitPointerLock();
        }
        else if(this.game_live_flag){  //game is live
            for(let target of this.target_info){
                target.timer++;
            }
            this.drawCrosshair(context, program_state);
            if(this.gun_small_flag){
                this.draw_small_gun(context,program_state, t);
            }
            if(this.gun_medium_flag){
                this.draw_medium_gun(context,program_state, t);
            }
            if(this.gun_large_flag){
                this.draw_large_gun(context,program_state,t);
            }
            this.drawTextOverlays(context,program_state);
            this.drawBulletMarks(context,program_state);
            this.gameTimeControl(); 
        }
        
    }

}