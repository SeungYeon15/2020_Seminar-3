let http = require("http"),
  express = require("express"),
  bodyParser = require("body-parser");

let mysql = require("mysql");

let key;
let sensor = new Array(50);
let unit = new Array(50);
let actuator = new Array(50);
let sen_count = 0;
let unit_count = 0;
let act_count = 0;

let sensor_list = new Object();
let app = express();

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// let pool1 = {
//   connectionLimit: 10,
//   host: "localhost",
//   port: 3360,
//   user: "root",
//   password: "1234",
//   database: "world",
//   debug: false, //데이터베이스 처리 과정을 로그로 남김
// };

let pool2 = {
  host: "203.234.62.115",
  port: 3306,
  user: "root",
  password: "1234",
  database: "MetadataRegistry",
  debug: false, //데이터베이스 처리 과정을 로그로 남김
};

// let sensor_log = mysql.crateConnection(pool1);
let sensor_model = mysql.createConnection(pool2);

// sensor_log.connect();

// sensor_log.query("SELECT * FROM city ORDER BY id", function (err, results) {
//   if (!err) {
//     let now = {};
//     let log = new Object();
//     for (let i in results) {
//       if (!now) {
//         now["timestamp"] = results[i].timestamp;
//       }
//     }
//   }
//   sensor_log.end();
// });

sensor_model.connect();

sensor_model.query("SELECT * FROM specific_metadata", function (err, results) {
  if (!err) {
    for (let i in results) {
      if (key != results[i].id && key != undefined) {
        let arr = new Array();
        sensor.length = sen_count;
        unit.length = unit_count;
        actuator.length = act_count;
        arr.push(sensor);
        arr.push(unit);
        arr.push(actuator);
        sensor_list[key] = arr;
        arr.length = 0;
        key = results[i].id;
        sen_count = 0;
        unit_count = 0;
        act_count = 0;
      }
      let type = results[i].metadata_key.split("-");
      if (type[0] === "sensor") {
        let index = Number(type[1]);
        sensor[index] = results[i].metadata_value; //index 1에서부터 sensor name 저장함.
        sen_count += 1;
      } else if (type[0] === "sensor_unit") {
        let index = Number(type[1]);
        unit[index] = results[i].metadata_value;
        unit_count += 1;
      } else if (type[0] === "actuator") {
        let index = Number(type[1]);
        actuator[index] = {};
        actuator[index][results[i].metadata_value] = [];
        act_count += 1;
      } else if (type[0] === "actuator_act") {
        let act_kind = Number(type[1]);
        for (let j in actuator[act_kind]) {
          actuator[act_kind][j].push(results[i].metadata_value);
        }
      }
    }
  }
  sensor_model.end();
});

// router.route("/project/home").post(function (req, res) {
//   let deviceData = {};
//   if (당구) {
//     app.render("ejs 파일 이름", deviceData, function (err, html) {
//       if (err) {
//         console.log(err.stack + "");
//         return;
//       }
//       res.end(html);
//     });
//   }
// });

// let server = http.createServer(app).listen(app.get("port"), function () {
//   console.log("서버 연결");
// });