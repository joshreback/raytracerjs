class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  mul(other) {
    return new Color(
      this.r * other.r,
      this.g * other.g,
      this.b * other.b
    )
  }

  plus(other) {
    return new Color(
      this.r + other.r,
      this.g + other.g,
      this.b + other.b
    )
  }

  scale(other) {
    return new Color(
      this.r * other,
      this.g * other,
      this.b * other
    )
  }

  clamp(num) {
    return new Color(
      this._fitToRange(this.r),
      this._fitToRange(this.g),
      this._fitToRange(this.b),
    )
  }

  _fitToRange(num) {
    if (num < 0) {
      return 0;
    }
    if (num > 1) {
      return 1;
    }
    return num;
  }
}