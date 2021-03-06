class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(vec) {
    return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
  }

  minus(vec) {
    return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
  }

  scale(factor) {
    return new Vector(this.x * factor, this.y * factor, this.z * factor);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  magnitude() {
    return Math.sqrt(this.dot(this));
  }

  normalize() {
    return this.scale(1.0 / this.magnitude());
  }

  reverse() {
    return this.scale(-1);
  }

  static lerp(vec1, vec2, percent) {
    return vec1.scale(1.0 - percent).add(vec2.scale(percent))
  }
}

class Ray {
  constructor(origin, direction) {
    this.origin = origin;
    this.direction = direction;
  }
}