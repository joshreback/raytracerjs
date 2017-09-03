class RayTracer {
  constructor(camera, imagePlane) {
    this.camera = camera;
    this.imagePlane = imagePlane
  }

  scaledCoords(x, y){
    return {
      x: (x + 1) * (WIDTH / 2),
      y: (y + 0.75) * (HEIGHT / 1.5)
    }
  }

  colorAtCoordinate(x, y) {
    let alpha, beta, top, bottom, point, ray;

    alpha = x / WIDTH;
    beta = y / HEIGHT;
    top = Vector.lerp(this.imagePlane.vec1, this.imagePlane.vec2, alpha);
    bottom = Vector.lerp(this.imagePlane.vec3, this.imagePlane.vec4, alpha);
    point = Vector.lerp(top, bottom, beta);
    ray = new Ray(
      point,
      point.minus(camera)
    );

    let scaledCoords = this.scaledCoords(ray.direction.x, ray.direction.y);
    return new Color(scaledCoords.x, scaledCoords.y, 0);
  }

  trace() {
    let color;
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        color = this.colorAtCoordinate(x, y);

        image.putPixel(x, y, color);
      }
    }
  }
}
const WIDTH = 256;
const HEIGHT = 192;

const image = new Image(WIDTH, HEIGHT);
document.image = image;

const camera = new Vector(0, 0, -1);
const imagePlane = new ImagePlane(
  new Vector(1, 0.75, 0),
  new Vector(-1, 0.75, 0),
  new Vector(1, -0.75, 0),
  new Vector(-1, -0.75, 0)
)

tracer = new RayTracer(camera, imagePlane);
tracer.trace();

image.renderInto(document.querySelector('body'));
