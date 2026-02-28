async function* wordDataStream() {
  yield { status: "processing", sense_data: "Khởi tạo..." };
  await new Promise(r => setTimeout(r, 1000));
  
  yield { sense_data: "Đã có dữ liệu nghĩa", id: 1 };
  await new Promise(r => setTimeout(r, 1000));
  
  yield { sense_image: "https://thumb.png", id: 1 };
  await new Promise(r => setTimeout(r, 1000));
  
  yield { status: "completed" };
}