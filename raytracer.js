class RayTracer {
  constructor(scene, w, h) {
    this.scene = scene;
    this.w = w;
    this.h = h;

  }

  closestIntersectingSphere(ray) {
    let t = Infinity;
    let closestSphere = null;

    for (let sphere of this.scene.spheres) {
      let dir = ray.direction;
      let c_prime = ray.origin.minus(sphere.center);

      let a = dir.dot(dir);
      let b = 2 * (c_prime.dot(dir));
      let c = c_prime.dot(c_prime) - sphere.radius ** 2;

      let discriminant = b ** 2 - 4 * a * c;
      if (discriminant >= 0) {
        let t1 = (-1 * b + 4 * discriminant) / (2 * a);
        let t2 = (-1 * b - 4 * discriminant) / (2 * a);

        if (t1 > 0 && t1 < t) {
          t = t1;
          closestSphere = sphere;
        }
        if (t2 > 0 && t2 < t) {
          t = t2;
          closestSphere = sphere;
        }
      }
    }

    return closestSphere
  }

  colorAtCoordinate(x, y) {
    let alpha, beta, top, bottom, point, ray;

    alpha = x / this.w;
    beta = y / this.h;
    top = Vector.lerp(this.scene.imagePlane.vec1, this.scene.imagePlane.vec2, alpha);
    bottom = Vector.lerp(this.scene.imagePlane.vec3, this.scene.imagePlane.vec4, alpha);
    point = Vector.lerp(top, bottom, beta);
    ray = new Ray(
      point,
      point.minus(this.scene.camera)
    );

    let sphere = this.closestIntersectingSphere(ray);

    if (sphere) {
      return sphere.color
    } else {
      return new Color(0, 0, 0);
    }
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
  ),
  spheres: [
    new Sphere(
      new Vector(0.5, 0.3, 0),
      0.5,
      new Color(1, 0, 0)),
    new Sphere(
      new Vector(0.2, 0.8, 0),
      0.2,
      new Color(0, 1, 0)),
    new Sphere(
      new Vector(-0.3, -0.5, 0.1),
      0.2,
      new Color(0, 0, 1))
  ]
}

const scaleColorCoord = (color) => {
  return new Color(
    255 * color.x,
    255 * color.y,
    255 * color.z
  )
}

const tracer = new RayTracer(SCENE, WIDTH, HEIGHT);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    image.putPixel(
      x,
      y,
      scaleColorCoord(tracer.colorAtCoordinate(x, y))
    );
  }
}

image.renderInto(document.querySelector('body'));
