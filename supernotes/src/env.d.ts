declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Для SCSS / Sass (если используете)
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}