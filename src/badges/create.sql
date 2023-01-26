INSERT INTO badges (badgeId, title, description, image)
VALUES (1, "Welcome!", "당신의 첫 방문을 환영합니다!", "testImage");

INSERT INTO user_badges (userBadgeId, badgeId, userId)
VALUES (1, 1, 1);