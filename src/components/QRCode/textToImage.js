const textToImage = (text, fontSize) => {
  const canvas = document.createElement("canvas");
  canvas.width = 150;
  canvas.height = 50;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.font = `bold ${fontSize}px 'Baloo Bhai 2', sans-serif`; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
};

export default textToImage;