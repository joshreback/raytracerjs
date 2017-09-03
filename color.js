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
}