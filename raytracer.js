class RayTracer {
  constructor(scene, w, h) {
    this.scene = scene;
    this.w = w;
    this.h = h;

  }

  closestIntersectingSphere(ray, currentShape) {
    let t = Infinity;
    let closestSphere = null;

    for (let sphere of this.scene.objects) {
      if (currentShape !== undefined && sphere === currentShape) {
        continue;
      }

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

  isInShadow(sphere, p, L) {
    let testShadowRay = new Ray(
      p,
      L.location.minus(p)
    )

    let intersection = this.closestIntersectingSphere(testShadowRay, sphere);
    let t = intersection.t;

    return (intersection.sphere && t > 0 && t < 1);
  }

  getPhongIllumination(sphere, p, N) {
    // calculate ambient component
    let ambientComponent = this.scene.ambientLight.mul(sphere.material.ambient);

    let diffuseTotal = new Color(0, 0, 0);
    let specularTotal = new Color(0, 0, 0);

    for (let light of this.scene.lights) {
      // calculate whether point is in shadow
      if (this.isInShadow(sphere, p, light)) {
        continue;  // ignore diffuse & specular components
      }

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

    return ambientComponent.plus(diffuseTotal).plus(specularTotal);
  }

  trace(ray, numBounces) {
    let intersection = this.closestIntersectingSphere(ray);
    let sphere = intersection.sphere;

    if (sphere) {
      let p = this.intersectionPoint(ray.origin, intersection.t, ray.direction);
      let N = p.minus(sphere.center).normalize();
      let V = ray.direction.reverse().normalize();

      let R = N.scale(2 * N.dot(V)).minus(V);

      let newRay = new Ray(
        p.add(R.scale(0.01)),
        R
      );

      let phongIllumination = this.getPhongIllumination(sphere, p, N);
      if (numBounces == 0) {
        return phongIllumination
      } else {
        return phongIllumination.plus(
          sphere.material.reflectivity.mul(
            this.trace(newRay, --numBounces)
          )
        )
      }
    } else {
      return new Color(0, 0, 0);
    }
  }

  colorAtCoordinate(x, y) {
    let alpha, beta, deltaAlpha, deltaBeta, top, bottom, point, ray;

    deltaAlpha = (0.5) / this.w;
    deltaBeta = (0.5) / this.h;
    alpha = x / this.w;
    beta = y / this.h;

    const getPoint = (alphaParam, betaParam) => {
      top = Vector.lerp(this.scene.imagePlane.vec1, this.scene.imagePlane.vec2, alphaParam);
      bottom = Vector.lerp(this.scene.imagePlane.vec3, this.scene.imagePlane.vec4, alphaParam);
      point = Vector.lerp(top, bottom, betaParam);
      return point;
    }

    let points = []
    points.push(getPoint(alpha, beta));
    points.push(getPoint(alpha + deltaAlpha, beta));
    points.push(getPoint(alpha, beta + deltaBeta));
    points.push(getPoint(alpha + deltaAlpha, beta + deltaBeta));

    let avg = new Color(0, 0, 0);
    for (let pt of points) {
      ray = new Ray(
        pt,
        pt.minus(this.scene.camera)
      );
      avg = avg.plus(this.trace(ray, 3))
    }

    return avg.scale(1/4.0);
  }
}

const WIDTH = 256;
const HEIGHT = 192;

const image = new Image(WIDTH, HEIGHT);
document.image = image;

const SCENE = {
  camera: new Vector(1, 0, 2),
  imagePlane: {
    vec1: new Vector(-1.28, 0.86, -0.5),
    vec2: new Vector(1.28, 0.86, -0.5),
    vec3: new Vector(-1.28, -0.86, -0.5),
    vec4: new Vector(1.28, -0.86, -0.5)
  },
  objects: [
    new Sphere(
      new Vector(-0.4, -0.1, -1),
      0.5,
      new Material(
        new Color(0.7, 0.7, 0.7),
        new Color(0.9, 0.5, 0.2),  // red
        new Color(0.7, 0.7, 0.7),
        20,
        new Color(0.2, 0.5, 0.9)
      )
    ),
    new Sphere(
      new Vector(-0.4, 0.1, -3),
      0.8,
      new Material(
        new Color(0.3, 0.3, 0.3),
        new Color(0.2, 0.9, 0.5),  // green
        new Color(0.7, 0.7, 0.7),
        20,
        new Color(0.9, 0.2, 0.5)
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
      new Vector(-0.4, 0, 2),       // location
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

    image.putPixel(
      x,
      y,
      color
    );
  }
}

image.renderInto(document.querySelector('body'));
