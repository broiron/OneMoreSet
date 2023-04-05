module.exports = {
    MainHTML:function(title, info){ // One More Set!
      return `
      <!DOCTYPE html>
<html>
<head>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Dongle&family=Rubik+80s+Fade&family=Rubik+Spray+Paint&display=swap" rel="stylesheet">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Dongle&family=Rubik+80s+Fade&family=Rubik+Spray+Paint&display=swap');
    </style>

  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="base.css">
  <link rel="stylesheet" href="select_exercise.css">
  <title>${title}</title>
</head>
<body>
    <div class="outer_header">
        <div class="inner_header">
            <div class="header_main"></div>
            <div class="nav">
                <button class="nav_button" onclick = "location.href = '/';">Home</button>
                <button class="nav_button">공지사항</button>
                <button class="nav_button">커뮤니티</button>
                <button class="nav_button" onclick = "location.href = '/page/select';">운동하기</button>
            </div>
        </div>
    </div>
    <div class="height_space"></div>
    <div class="outer_body">
        <div class="inner_body">
            <div class="body_contents">
                <div class="main">
                    <div class="main_image_container" id="main">
                        <h1>One More Set!</h1>
                        <span>"</span><span>Winners Train, Losers Complain.</span><span>"</span>
                        <h2>운동할 시간이 나지 않는 사람들에게, 남의 시선이 두려운 사람들에게.</h2>
                        <h2>저희 One More Set이 해답을 제시합니다.</h2>
                        <button onclick="main_next_button();">다음으로</button>
                    </div>
                </div>
            </div>
            ${info}
        </div>
    </div>
    <div class="outer_bottom"></div>
    <script>
        function main_next_button(){
            let element = document.getElementById('main');
            element.innerHTML = "<h4>AI 기반의 홈트레이닝 서비스</h4><h2>운동하기를 누르고, 시작하기만 하면 됩니다.</h2><h2>Google Teachable Machine 기반의 AI가, 당신의 운동을 도와줄 것입니다.</h2>";
        }
    </script>
</body>
</html>
      `;
    },exerciseHTML:function(title, path, control, info, description){
      return `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="../base.css">
  <link rel="stylesheet" href="../select_exercise.css">
  <title>${title}</title>
</head>
<body>
<div class="outer_header">
<div class="inner_header">
    <div class="header_main"></div>
    <div class="nav">
        <button class="nav_button" onclick = "location.href = '/page';">Home</button>
        <button class="nav_button">공지사항</button>
        <button class="nav_button">커뮤니티</button>
        <button class="nav_button" onclick = "location.href = '/page/select';">운동하기</button>
    </div>
</div>
</div>
<div class="height_space"></div>
    <div class="outer_body">
        <div class="inner_body">
            <div class="body_contents">
                <div id="exercise">
                    <div id="video">
                      <div id="cam">
                        <canvas id="canvas"></canvas>
                      </div>
                      ${control}
                      <div id="labelandcount">
                        <div id="label-container"></div>
                        <div id="count-field">현재 <span id="count">0</span>회 입니다.</div>
                      </div>
                    </div>
                  </div>
            </div>
            <div class="sidebar">
                ${info}
                        ${description}
                    </div>
            </div>
        </div>
    </div>

    <div class="outer_bottom"></div>

<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@teachablemachine/pose@0.8/dist/teachablemachine-pose.min.js"></script>
<script type="text/javascript" src=${path}> </script>
      `
    },pageSelectHTML:function(title, control, info){
      return `
      <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="../base.css">
  <title>${title}</title>
</head>
<body>
    <div class="outer_header">
        <div class="inner_header">
            <div class="header_main"></div>
            <div class="nav">
                <button class="nav_button">Home</button>
                <button class="nav_button">공지사항</button>
                <button class="nav_button">커뮤니티</button>
                <button class="nav_button">운동하기</button>
            </div>
        </div>
    </div>
    <div class="height_space"></div>
    <div class="outer_body">
        <div class="inner_body">
            <div class="body_contents" id="select_exercise">
                <div>
                    ${control}
                </div>
            </div>
            ${info}
        </div>
    </div>

    <div class="outer_bottom"></div>
</body>
</html>
      `;
    },SignUp:function(title){ // One More Set!
        return `
        <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <link rel="stylesheet" href="base.css">
    <title>One More Set!</title>
    <title>${title}</title>
  </head>
  <body>
  <div class="height_space"></div>
  <div class="outer_body">
    <div class="inner_body">
        <form action="/signup" method="post">
            <div id="sign-up">
                <div class="event" id="border">
                      <h4>사용할 ID를 입력하세요: <input type="text" id="signid" name="sid" placeholder="ID" required></h4>
                      <h4>사용할 PW를 입력하세요: <input type="text" id="signpw" name="spw" placeholder="PW" required></h4>
                      <h4>사용할 닉네임을 입력하세요: <input type="text" id="signnickname" name="snickname" placeholder="NICKNAME" reqired></h4>
                      <div>
                          <button type="submit" id="login-button" onclick="location.href='/signup' ">회원가입</button>
                      </div>
                </div>
            </div>
        </form>
    </div>
  </div>
  
  <div class="outer_bottom"></div>
  </body>
  </html>
      `;
    },Info:function(title, totalInfo, sidebarInfo){ // information template
        return `
        <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="../base.css">
  <link rel="stylesheet" href="../select_exercise.css">
  <title>${title}</title>
</head>
<body>
    <div class="outer_header">
        <div class="inner_header">
            <div class="header_main"></div>
            <div class="nav">

                <button class="nav_button" onclick = "location.href = '/page';">Home</button>
                <button class="nav_button">공지사항</button>
                <button class="nav_button">커뮤니티</button>
                <button class="nav_button" onclick = "location.href = '/page/select';">운동하기</button>
            </div>
        </div>
    </div>
    <div class="height_space"></div>
    <div class="outer_body">
        <div class="inner_body">
            <div class="body_contents">
                ${totalInfo}
            </div>
            ${sidebarInfo}
        </div>
    </div>

    <div class="outer_bottom"></div>
</body>
</html>
        `
    }
  }
  