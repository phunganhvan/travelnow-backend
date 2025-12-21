const Hotel = require('../../models/Hotel');
const cloudinary = require('../../config/cloudinary');

async function listHotels(req, res, next) {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });
    res.json({ hotels });
  } catch (error) {
    next(error);
  }
}

async function getHotel(req, res, next) {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }
    res.json({ hotel });
  } catch (error) {
    next(error);
  }
}

async function createHotel(req, res, next) {
  try {
    const { imageDataUrls, ...data } = req.body;

    let imageUrl = data.imageUrl;
    let imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [];

    if (Array.isArray(imageDataUrls) && imageDataUrls.length > 0) {
      const uploads = await Promise.all(
        imageDataUrls.map((src) =>
          cloudinary.uploader.upload(src, {
            folder: 'travelnow/hotels'
          })
        )
      );

      const uploadedUrls = uploads.map((u) => u.secure_url).filter(Boolean);
      if (uploadedUrls.length > 0) {
        imageUrls = uploadedUrls;
        if (!imageUrl) {
          imageUrl = uploadedUrls[0];
        }
      }
    }

    const payload = {
      ...data
    };

    if (imageUrl) payload.imageUrl = imageUrl;
    if (imageUrls && imageUrls.length > 0) payload.imageUrls = imageUrls;

    const hotel = await Hotel.create(payload);
    res.status(201).json({ hotel });
  } catch (error) {
    next(error);
  }
}

async function updateHotel(req, res, next) {
  try {
    const { imageDataUrls, imageUrls: existingImageUrls, ...data } = req.body;

    let imageUrls = Array.isArray(existingImageUrls)
      ? existingImageUrls.filter(Boolean)
      : [];

    // Nếu chưa truyền imageUrls nhưng model đang có imageUrls cũ, sẽ được giữ nguyên
    // khi client không gửi trường này.

    if (Array.isArray(imageDataUrls) && imageDataUrls.length > 0) {
      const uploads = await Promise.all(
        imageDataUrls.map((src) =>
          cloudinary.uploader.upload(src, {
            folder: 'travelnow/hotels'
          })
        )
      );

      const uploadedUrls = uploads.map((u) => u.secure_url).filter(Boolean);
      if (uploadedUrls.length > 0) {
        imageUrls = [...imageUrls, ...uploadedUrls];
      }
    }

    let imageUrl = data.imageUrl;
    if (!imageUrl && imageUrls.length > 0) {
      imageUrl = imageUrls[0];
    }

    const payload = {
      ...data
    };

    if (imageUrl) payload.imageUrl = imageUrl;
    if (imageUrls && imageUrls.length > 0) payload.imageUrls = imageUrls;

    const hotel = await Hotel.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    res.json({ hotel });
  } catch (error) {
    next(error);
  }
}

async function deleteHotel(req, res, next) {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Không tìm thấy khách sạn' });
    }

    res.json({ message: 'Xóa khách sạn thành công' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
};
