class RayTracer {
  constructor(scene, w, h) {
    this.scene = scene;
    this.w = w;
    this.h = h;

  }

  scaledCoords(x, y){
    return {
      x: (x + 1) * (this.w / 2),
      y: (y + 0.75) * (this.h / 1.5)
    }
  }

  colorAtCoordinate(x, y) {
    let alpha, beta, top, bottom, point, ray;

    alpha = x / this.w;
    beta = y / this.h;
    top = Vector.lerp(this.scene.imagePlane.vec1, this.imagePlane.vec2, alpha);
    bottom = Vector.lerp(this.scene.imagePlane.vec3, this.imagePlane.vec4, alpha);
    point = Vector.lerp(top, bottom, beta);
    ray = new Ray(
      point,
      point.minus(this.scene.camera)
    );

    let scaledCoords = this.scaledCoords(ray.direction.x, ray.direction.y);
    return new Color(scaledCoords.x, scaledCoords.y, 0);
  }
}
const WIDTH = 256;
const HEIGHT = 192;

const image = new Image(WIDTH, HEIGHT);
document.image = image;

const SCENE = {
  camera: new Vector(0, 0, -1),
  imagePlane: new ImagePlane(
    new Vector(1, 0.75, 0),
    new Vector(-1, 0.75, 0),
    new Vector(1, -0.75, 0),
    new Vector(-1, -0.75, 0)
  )
}

const tracer = new RayTracer(SCENE, WIDTH, HEIGHT);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    image.putPixel(
      x,
      y,
      this.colorAtCoordinate(x, y);
    );
  }
}

image.renderInto(document.querySelector('body'));
