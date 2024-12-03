package com.gromit.auction_back.requestItem.ImageUpload.image;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/images")
public class ImageController {
    private static final Logger logger = LoggerFactory.getLogger(ImageController.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.base-url}")
    private String baseUrl;

    @Autowired
    private ImageService imageService;


    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Path filePath = Paths.get(uploadDir).resolve(filename); // 파일 경로 생성
        Resource resource = new FileSystemResource(filePath); // 파일을 리소스로 변환

        if (!resource.exists()) {
            return ResponseEntity.notFound().build(); // 파일이 존재하지 않으면 404 반환
        }
        String fileExtension = StringUtils.getFilenameExtension(filename).toLowerCase(); // 파일 확장자 추출
        MediaType mediaType = getMediaType(fileExtension);

        // 이미지 파일 반환 (이미지 형식에 맞는 Content-Type을 설정)
        return ResponseEntity.ok()
                .contentType(mediaType) // 이미지 형식에 맞게 설정 (필요에 따라 변경)
                .body(resource);
    }


    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadImages(
            @RequestParam("images") MultipartFile[] files,
            @RequestParam("postId") int postId) {
        List<String> fileUrls = new ArrayList<>();
        logger.info("Uploading files: {}, postId: {}", Arrays.toString(files), postId);
        // 여러 이미지 URL을 저장
        for (MultipartFile file : files) {
            try {
                String fileName = saveFile(file);
                String fileUrl = baseUrl + fileName;
                fileUrls.add(fileUrl);  // URL 리스트에 추가

            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Collections.singletonList("비상비상~! :" + e.getMessage()));
            }
        }
        // 이미지 URL들을 한 번에 저장
        imageService.addImages(postId, fileUrls);
        // 저장된 URL 리스트 반환
        return ResponseEntity.ok(fileUrls);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<ImageDTO>> getImageByPostId(@PathVariable int postId) {
        List<ImageDTO> images = imageService.getImageByPostId(postId);

        if (images != null) {
            return ResponseEntity.ok(images);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 파일 저장하는 메소드
    private String saveFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        // 로그 추가
        System.out.println("파일 저장 경로: " + filePath.toString());

        Files.createDirectories(filePath.getParent()); // 디렉토리 생성
        Files.write(filePath, file.getBytes()); // 파일 저장
        System.out.println("파일 저장 완료: " + fileName);

        return fileName;
    }
    private MediaType getMediaType(String fileExtension) {
        switch (fileExtension) {
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "gif":
                return MediaType.IMAGE_GIF;
            case "bmp":
                return MediaType.valueOf("image/bmp");
            case "webp":
                return MediaType.valueOf("image/webp");
            case "tiff":
                return MediaType.valueOf("image/tiff");
            case "ico":
                return MediaType.valueOf("image/x-icon");
            case "svg":
                return MediaType.valueOf("image/svg+xml");
            // 그 외 이미지 형식 처리
            default:
                return MediaType.valueOf("image/*"); // 범용적인 이미지 타입
        }
    }


    // 게시물 수정 페이지 - 이미지 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteImg( @RequestParam(required = false) String imageUrl,
                                        @RequestParam(required = false) int postId) {

        try {
            int result = imageService.deleteImg(imageUrl,postId);
            if (result > 0) {
                return new ResponseEntity<>("이미지 삭제 성공",  HttpStatus.OK);
            } else {
                return new ResponseEntity<>("이미지 삭제 실패", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            System.out.println("에러 발생: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

