package com.gromit.auction_back.auction;

import jakarta.validation.Valid;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Valid
public class AuctionDTO {

    private int postId;
    private String title;
    private String categoryCode;
    private String content;
    private Date createdAt;
    private String postStatus;
    private Date startDay;
    private Date endDay;
    private int userCode;
    private int startCash;
    private int finalCash;
    private boolean usePost;
}
