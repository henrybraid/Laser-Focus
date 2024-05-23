import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;



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
        
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }



    display(context,program_state){

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }
        
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 100);

        
        let model_transform = Mat4.identity();
        const light_position = vec4(0,0, 0, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)]; 
        
        console.log("Drawing target");

        
        this.shapes.target.draw(context,program_state,model_transform, this.materials.test);

        this.shapes.target.draw(context,program_state, model_transform.times(Mat4.translation(4,0,0)), this.materials.test);
        
    }

    

}