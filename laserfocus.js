import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


/*class MouseController{
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
        

        document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        document.addEventListener('mouseup', (e) =>this.onMouseUp(e), false);
        document.addEventListener('mousemove', (e) =>this.onMouseMove(e), false);
    }

    onMouseMove(e){
        this.current.mouseX = e.pageX - window.innerWidth /2;
        this.current.mouseY = e.pageY - window.innerWidth /2;
        if(this.previous===null){
            this.previous = {...this.current};
        }
        this.current.mouseXchange = this.current.mouseX - this.previous.mouseX;
        this.current.mouseYchange = this.current.mouseY - this.previous.mouseY;
    }

    onMouseDown(e){
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
}
*/


export class laserfocus extends Scene{
    constructor(){
        super();
        this.shapes = {
            target: new defs.Subdivision_Sphere(4),
        };

        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color:hex_color("#FFFFFF")}),
        }
        
        //this.input = new MouseController(context.canvas);

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
        
        this.shapes.target.draw(context,program_state,model_transform, this.materials.test);
        //fprogram_state.set_camera(move_camera(context,program_state,program_state.camera_location));
    }

    move_camera(context,program_state, camera_location)
    {
        const xh = this.input.current.mouseXchange / context.canvas.innerWidth;
        const yh = this.input.current.mouseYchange / context.canvas.innerHeight;

        camera_location = camera_location.times(Mat4.translation(xh,yh,0));
        return camera_location;
    }

}