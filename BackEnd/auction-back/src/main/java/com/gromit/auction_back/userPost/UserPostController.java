package com.gromit.auction_back.userPost;


import com.gromit.auction_back.auction.AuctionController;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/afterlive")
public class UserPostController {

    private final UserPostService userPostService;

    public UserPostController(UserPostService userPostService) {
        this.userPostService = userPostService;
    }

    private static final Logger logger = LoggerFactory.getLogger(AuctionController.class);


    @PutMapping("/putuserpost")
    public ResponseEntity<?> putUserPost(@RequestBody UserPostDTO userPostDTO) {
        try {
            int result = userPostService.putUserPost(userPostDTO);
            if (result > 0) {
                System.out.println("낙찰자 저장");
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("낙찰자 저장 실패");
            }
        } catch (Exception e) {
            logger.error("낙찰자 저장 중 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/getuserpost")
    public ResponseEntity<List<UserPostDTO>> getUserPost(@RequestParam(required = false) int postId,
                                                        @RequestParam(required = false) int userCode) {
        try {
            List<UserPostDTO> items = userPostService.getUserPost(postId, userCode);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            System.out.println("에러 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }


    }

}
