class RayTracer {
  constructor(scene, w, h) {
    this.scene = scene;
    this.w = w;
    this.h = h;

  }

  closestIntersectingSphere(ray) {
    let t = Infinity;
    let closestSphere = null;

    for (let sphere of this.scene.objects) {
      let dir = ray.direction;
      let cPrime = ray.origin.minus(sphere.center);

      let a = dir.dot(dir);
      let b = 2 * (cPrime.dot(dir));
      let c = cPrime.dot(cPrime) - sphere.radius ** 2;

      let discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        let t1 = (-1 * b + Math.sqrt(discriminant)) / (2 * a);
        let t2 = (-1 * b - Math.sqrt(discriminant)) / (2 * a);

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

    return {
      t: t,
      sphere: closestSphere
    }
  }

  intersectionPoint(o, t, dir) {
    return o.add(dir.scale(t));
  }

  getPhongColor(sphere, p, N) {
    // calculate ambient component
    let ambientComponent = this.scene.ambientLight.mul(sphere.material.ambient);

    let diffuseTotal = new Color(0, 0, 0);
    let specularTotal = new Color(0, 0, 0);

    for (let light of this.scene.lights) {
      // calculate diffuse component
      let L = light.location.minus(p).normalize();
      if (N.dot(L) >= 0) {
        diffuseTotal = diffuseTotal.plus(
          sphere.material.diffuse.mul(light.diffuseIntensity).scale(N.dot(L))
        );

        // calculate reflectance vector
        let reflectance = N.scale(2 * N.dot(L)).minus(L);

        let view = this.scene.camera.minus(p).normalize();
        let specular = (sphere.material.specular)
          .mul(light.specularIntensity)
          .scale(
            Math.pow(view.dot(reflectance),sphere.material.shininess)
          );

        specularTotal = specularTotal.plus(specular)
      }
    }

    // console.log(specularTotal);
    return ambientComponent.plus(diffuseTotal).plus(specularTotal);
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

    let intersection = this.closestIntersectingSphere(ray);
    let sphere = intersection.sphere;

    if (sphere) {
      let p = this.intersectionPoint(ray.origin, intersection.t, ray.direction);
      let N = p.minus(sphere.center).normalize();
      return this.getPhongColor(sphere, p, N);
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
  camera: new Vector(0, 0, 2),
  imagePlane: {
    vec1: new Vector(-1.28, 0.86, -0.5),
    vec2: new Vector(1.28, 0.86, -0.5),
    vec3: new Vector(-1.28, -0.86, -0.5),
    vec4: new Vector(1.28, -0.86, -0.5)
  },
  objects: [
    new Sphere(
      new Vector(-1.1, 0.6, -1),
      0.2,
      new Material(
        new Color(0.7, 0.7, 0.7),  // a
        new Color(0.4, 0.4, 0.9),  // d
        new Color(0.7, 0.7, 0.7),  // s
        20                         // alpha
      )
    ),
    new Sphere(
      new Vector(0.2, -0.1, -1),
      0.5,
      new Material(
        new Color(0.7, 0.7, 0.7),
        new Color(0.9, 0.5, 0.5),
        new Color(0.7, 0.7, 0.7),
        20
      )
    ),
    new Sphere(
      new Vector(1.2, -0.5, -1.75),
      0.4,
      new Material(
        new Color(0, 0, 0),
        new Color(0.5, 0.9, 0.5),
        new Color(0.7, 0.7, 0.7),
        20
      )
    )
  ],
  lights: [
    // new Light(
    //   new Vector(-3, -0.5, 1),
    //   new Color(0.8, 0.3, 0.3),
    //   new Color(0.8, 0.8, 0.8)
    // ),
    new Light(
      new Vector(3, 2, 1),       // location
      new Color(0.6, 0.6, 0.6),  // diffuse
      new Color(0.2, 0.2, 0.2)   // specular
    )
  ],
  ambientLight: new Color(0.3, 0.3, 0.3)
};

const scaleColorCoord = (color) => {
  return new Color(
    255.0 * color.r,
    255.0 * color.g,
    255.0 * color.b
  )
}

const tracer = new RayTracer(SCENE, WIDTH, HEIGHT);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    let color = scaleColorCoord(tracer.colorAtCoordinate(x, y).clamp());

    // if (color.r !== 0 && color.g !== 0 && color.b !== 0) {
    //   debugger;
    // }

    image.putPixel(
      x,
      y,
      color
    );
  }
}

image.renderInto(document.querySelector('body'));
