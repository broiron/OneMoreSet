const express = require("express");
const fs = require("fs");
const app = express();
const template = require('./libs/template.js');
const bodyparser = require('body-parser');
const sanitizeHtml = require('sanitize-html');
const path = require('path');
const db = require('./libs/db.js');

let nick;
let squat_rank, pushup_rank, lunge_rank;
let squat_cnt, pushup_cnt, lunge_cnt;

app.use(bodyparser.urlencoded({ extended: false})); 
app.use(bodyparser.json());

app.use(express.static("static"));
app.use(express.static("css"));

app.get('/', function(request, response){
    var info = `
    <div class="sidebar">
                <div class="profile">
                      <form action="/login" method="post">
                          <div>
                            <input type="text" id="id" name="lid" placeholder="ID"> <!-- app.post 방식의 /login 필요함-->
                            <input type="password" id="pw" name="lpw" placeholder="PW">
                          </div>
                          <div>
                            <button type="button" onclick="location.href='/signup' ">회원가입</button>
                            <button type="submit" id="login-button" onclick="location.href='/login' ">로그인</button> <!-- app.post 방식의 /login 필요함-->
                          </div>
                      </form>
                </div>
            </div>
    `
    var html = template.MainHTML("One More Set!", info);
    response.send(html);
})

app.post('/login', function(request, response){
    var id = String(request.body.lid);
    var pw = String(request.body.lpw);
    //var tempNick = 'default';

    db.query('select pw from userinfo where id=?', [id], function(err, result){
      if(err){
        throw err;
      }
      else if(result[0].pw == pw){
        db.query('select nickname from userinfo where id=?', [id], function(err, result){
            nick = result[0].nickname;
        });
       //tempNick = nick;
        db.query('select ranking from (select id, rank() over (order by pushup desc) as ranking from ranking) as A where id = ?', [id], function(err, result){
            pushup_rank = result[0].ranking;
        });
        db.query('select ranking from (select id, rank() over (order by lunge desc) as ranking from ranking) as A where id = ?', [id], function(err, result){
            lunge_rank = result[0].ranking;
        });
        db.query('select ranking from (select id, rank() over (order by squat desc) as ranking from ranking) as A where id = ?', [id], function(err, result){
            squat_rank = result[0].ranking;
        });
        
        db.query('select pushup from ranking where id=?', [id], function(err, result){
            pushup_cnt = result[0].pushup;
        });
        db.query('select lunge from ranking where id=?', [id], function(err, result){
            lunge_cnt = result[0].lunge;
        });
        db.query('select squat from ranking where id=?', [id], function(err, result){
            squat_cnt = result[0].squat;
        });
        
        response.redirect('/page');
      }
      else{
        response.redirect('/');
      }
    });
})

app.get('/signup', function(request, response){ // 회원가입
    var html = template.SignUp("회원 가입")
    response.send(html);
})

app.post('/signup', function(request, response){ //

    var id = String(request.body.sid);
    var pw = String(request.body.spw);
    var nickname = String(request.body.snickname);

    db.query('select id from userinfo where id=?', [id], function(err,result){
      if (result.length == 0){
        db.query('insert into userinfo(id, pw, nickname) values(?,?,?)', [id, pw, nickname]);
        db.query('insert into ranking(id, nickname, squat, pushup, lunge) values(?,?,?,?,?)', [id, nickname, 0, 0, 0]);
        response.redirect('/');
      }
      else{
        response.redirect('/signup');
      }
    });
})

app.get('/page', function(request, response){
    
    db.query('select ranking from (select NICKNAME, rank() over (order by pushup desc) as ranking from ranking) as A where NICKNAME = ?', [nick], function(err, result){
        pushup_rank = result[0].ranking;
    });
    db.query('select ranking from (select NICKNAME, rank() over (order by lunge desc) as ranking from ranking) as A where NICKNAME = ?', [nick], function(err, result){
        lunge_rank = result[0].ranking;
    });
    db.query('select ranking from (select NICKNAME, rank() over (order by squat desc) as ranking from ranking) as A where NICKNAME = ?', [nick], function(err, result){
        squat_rank = result[0].ranking;
    });

    var info = `
    <div class="sidebar">
                <div class="profile_after"> <!-- 이 div는 로그아웃 시 class="profile"인 div로 바뀝니다.-->
                    <div class="welcome">
                        환영합니다, <span>${nick}</span>님.
                    </div>    
                    <div class="profile_ranking">
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                    </div>
                    <div class="profile_buttons">
                        <div><button  onclick = "location.href = '/page/info';">회원 정보</button></div>
                        <div><button onclick = "location.href = '/'; ">로그아웃</button></div>
                    </div>
                </div>
            </div>
    `
    var html = template.MainHTML("/page", info);
    response.send(html);
})

app.get('/page/info', function(request, response){
    
    var sidebarInfo = `
    <div class="sidebar">
                <div class="profile_after"> <!-- 이 div는 로그아웃 시 class="profile"인 div로 바뀝니다.-->
                    <div class="welcome">
                        환영합니다, <span>${nick}</span>님.
                    </div>    
                    <div class="profile_ranking">
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                    </div>
                    <div class="profile_buttons">
                        <div><button  onclick = "location.href = '/page/info';">회원 정보</button></div>
                        <div><button onclick = "location.href = '/'; ">로그아웃</button></div>
                    </div>
                </div>
            </div>
    `

    var totalInfo = `
    <div class="user_page">
                    <h1>회원 정보</h1>
                    <div>
                        <div>닉네임 : <span> ${nick}</span></div>
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                        <div>팔굽혀펴기 횟수 : <span>${pushup_cnt}</span>개</div>
                        <div>스쿼트 횟수 : <span>${squat_cnt}</span>개</div>
                        <div>런지 횟수 : <span>${lunge_cnt}</span>개</div>
                    </div>
                </div>
    `
    
    var html = template.Info('info', totalInfo, sidebarInfo)
    response.send(html);
})


app.get('/page/select', function(request, response){
    var info = `
    <div class="sidebar">
                <div class="profile_after"> <!-- 이 div는 로그아웃 시 class="profile"인 div로 바뀝니다.-->
                    <div class="welcome">
                        환영합니다, <span>${nick}</span>님.
                    </div>    
                    <div class="profile_ranking">
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                    </div>
                    <div class="profile_buttons">
                        <div><button  onclick = "location.href = '/page/info';">회원 정보</button></div>
                        <div><button onclick = "location.href = '/'; ">로그아웃</button></div>
                    </div>
                </div>
            </div>
    `
    var control = `
    <button onclick = "location.href = '/page/squat';">스쿼트</button>
    <button onclick = "location.href = '/page/pushup';">팔굽혀펴기</button>
    <button onclick = "location.href = '/page/lunge';">런지</button>`

    var html = template.pageSelectHTML("page-select", control, info);
    response.send(html);
})


app.get('/page/squat', function(request, response){
    
    var control = `
    <form action='/page/aftersquat' method="POST"> 
                      <input type="text" name="number" placeholder="운동 횟수">
                      <button type="button" onclick="init();">운동 시작!</button>
                      <button type="submit" onclick= "location.href = '/page/aftersquat'; ">운동 완료!</button>
                      </form>

    `
    var info = `
                <div class="profile_after"> <!-- 이 div는 로그아웃 시 class="profile"인 div로 바뀝니다.-->
                    <div class="welcome">
                        환영합니다, <span>${nick}</span>님.
                    </div>    
                    <div class="profile_ranking">
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                    </div>
                    <div class="profile_buttons">
                        <div><button  onclick = "location.href = '/page/info';">회원 정보</button></div>
                        <div><button onclick = "location.href = '/'; ">로그아웃</button></div>
                    </div>
                </div>
    `
    var descrpition = `
    <div class="exercise_description">
                        <div class="exercise_description_gif">
                            <img src="../data/squat.gif" alt="">
                        </div>
    <div class="exercise_description_description">
                            <h3>One More Set! 사용 방법</h3>
                            <div>
                                1. 스쿼트를 얼마나 할 것인지, 그 횟수를 입력하고 운동 시작 버튼을 누릅니다. <br>
                                2. 위 모범 동영상과 같이 찍히도록 몸의 각도를 조절합니다. <br>
                                3. 횟수가 끝날 때까지 운동합니다. 
                            </div>
                            <h3>스쿼트 시 주의사항</h3>
                            <div>
                                등이 굽어지지 않도록 한다. <br>
                                무릎이 너무 앞으로 나가지 않도록 한다. <br>
                                너무 깊게 앉지 않도록 한다.
                            </div>
                        </div>
    `
    var html = template.exerciseHTML('squat', "../squat_predict.js", control, info, descrpition);
    response.send(html); 
});


app.get('/page/lunge', function(request, response){
    
    var control = `
    <form action='/page/afterlunge' method="POST"> 
                      <input type="text" name="number" placeholder="운동 횟수">
                      <button type="button" onclick="init();">운동 시작!</button>
                      <button type="submit" onclick= "location.href = '/page/afterlunge'; ">운동 완료!</button>
                      </form>

    `
    var info = `
                <div class="profile_after"> <!-- 이 div는 로그아웃 시 class="profile"인 div로 바뀝니다.-->
                    <div class="welcome">
                        환영합니다, <span>${nick}</span>님.
                    </div>    
                    <div class="profile_ranking">
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                    </div>
                    <div class="profile_buttons">
                        <div><button  onclick = "location.href = '/page/info';">회원 정보</button></div>
                        <div><button onclick = "location.href = '/'; ">로그아웃</button></div>
                    </div>
                </div>
    `

    var description = `
    <div class="exercise_description">
                        <div class="exercise_description_gif">
                            <img src="../data/lunge.gif" alt="">
                        </div>
    <div class="exercise_description_description">
                            <h3>One More Set! 사용 방법</h3>
                            <div>
                                1. 런지를 얼마나 할 것인지, 그 횟수를 입력하고 운동 시작 버튼을 누릅니다. <br>
                                2. 위 모범 동영상과 같이 찍히도록 몸의 각도를 조절합니다. <br>
                                3. 횟수가 끝날 때까지 운동합니다. 
                            </div>
                            <h3>런지 시 주의사항</h3>
                            <div>
                                한 쪽만 하는 것이 아닌, 양 다리 돌아가면서 한다. <br>
                                무릎이 90도가 될 정도까지 앉아준다. <br>
                                무릎이 너무 앞으로 나가지 않도록 한다.

                            </div>
                        </div>
    `
    var html = template.exerciseHTML('lunge', "../lunge_predict.js", control, info, description);
    response.send(html);
})

app.get('/page/pushup', async function(request, response){

    var control = `
    <form action='/page/afterpushup' method="POST"> 
                      <input type="text" name="number" placeholder="운동 횟수">
                      <button type="button" onclick="init();">운동 시작!</button>
                      <button type="submit" onclick= "location.href = '/page/afterpushup'; ">운동 완료!</button>
                      </form>

    `
    var info = `
                <div class="profile_after"> <!-- 이 div는 로그아웃 시 class="profile"인 div로 바뀝니다.-->
                    <div class="welcome">
                        환영합니다, <span>${nick}</span>님.
                    </div>    
                    <div class="profile_ranking">
                        <div>팔굽혀펴기 랭킹 : <span>${pushup_rank}</span>위</div>
                        <div>스쿼트 랭킹 : <span>${squat_rank}</span>위</div>
                        <div>런지 랭킹 : <span>${lunge_rank}</span>위</div> 
                    </div>
                    <div class="profile_buttons">
                        <div><button  onclick = "location.href = '/page/info';">회원 정보</button></div>
                        <div><button onclick = "location.href = '/'; ">로그아웃</button></div>
                    </div>
                </div>
    `

    var description = `
    <div class="exercise_description">
                        <div class="exercise_description_gif">
                            <img src="../data/pushup.gif" alt="">
                        </div>
    <div class="exercise_description_description">
                            <h3>One More Set! 사용 방법</h3>
                            <div>
                                1. 팔굽혀펴기를 얼마나 할 것인지, 그 횟수를 입력하고 운동 시작 버튼을 누릅니다. <br>
                                2. 위 모범 동영상과 같이 찍히도록 몸의 각도를 조절합니다. <br>
                                3. 횟수가 끝날 때까지 운동합니다. 
                            </div>
                            <h3>팔굽혀펴기 시 주의사항</h3>
                            <div>
                                가슴이 땅에 닿기 직전까지 내려가도록 한다.
                            </div>
                        </div>
    `
    var html = template.exerciseHTML('pushup', "../pushup_predict.js", control, info, description);
    response.send(html);
})

app.post('/page/afterpushup', function(request, response){
    
    var tempCnt = 0;
    var cnt = request.body.number;

    db.query('select pushup from ranking where nickname=?', [nick], function(err, result){
        tempCnt = parseInt(cnt) + parseInt(result[0].pushup);
        db.query('update ranking set pushup=? where nickname=?', [tempCnt, nick]);
        pushup_cnt = tempCnt;
    });

    db.query('select ranking from (select NICKNAME, rank() over (order by pushup desc) as ranking from ranking) as A where NICKNAME = ?', [nick], function(err, result){
        pushup_rank = result[0].ranking;
    });

    response.redirect('/page');
    response.end();
})

app.post('/page/aftersquat', function(request, response){
    var tempCnt = 0;
    var cnt = request.body.number;

    db.query('select squat from ranking where nickname=?', [nick], function(err, result){
        tempCnt = parseInt(cnt) + parseInt(result[0].squat);
        db.query('update ranking set squat=? where nickname=?', [tempCnt, nick]);
        squat_cnt = tempCnt;
    });

    db.query('select ranking from (select NICKNAME, rank() over (order by squat desc) as ranking from ranking) as A where NICKNAME = ?', [nick], function(err, result){
        squat_rank = result[0].ranking;
    });

    response.redirect('/page');
    response.end();
})

app.post('/page/afterlunge', function(request, response){
    var tempCnt = 0;
    var cnt = request.body.number;

    db.query('select lunge from ranking where nickname=?', [nick], function(err, result){
        tempCnt = parseInt(cnt) + parseInt(result[0].lunge);
        db.query('update ranking set lunge=? where nickname=?', [tempCnt, nick]);
        lunge_cnt = tempCnt;
    });

    db.query('select ranking from (select NICKNAME, rank() over (order by lunge desc) as ranking from ranking) as A where NICKNAME = ?', [nick], function(err, result){
        lunge_rank = result[0].ranking;
    });
    
    response.redirect('/page');
    response.end();
})
module.exports = app;