package com.gromit.auction_back.requestItem.ImageUpload.image;

import com.gromit.auction_back.requestItem.ImageUpload.mapper.ImageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImageService {
    @Autowired
    private ImageMapper imageMapper;

    // 여러 이미지 URL 저장
    public void addImages(int postId, List<String> imageUrls) {
        for (String imageUrl : imageUrls) {
            ImageDTO imageDTO = new ImageDTO();
            imageDTO.setPostId(postId);
            imageDTO.setImageUrl(imageUrl);
            imageMapper.insertImage(imageDTO);  // 이미지 URL을 DB에 저장
        }
    }


    public List<ImageDTO> getImageByPostId(int postId) {
        return imageMapper.selectImageByPostId(postId);
    }

    public int deleteImg(String imageUrl, int postId) {
        int result = imageMapper.delete(imageUrl, postId);
        return result;
    }

    public void addImageUrl(int postId, String imageUrl) {
        imageMapper.saveImageUrl(postId, imageUrl);
    }
}