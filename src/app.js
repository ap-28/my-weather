//jshint esversion:6

const fs = require("fs");
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const path = require("path");
const requests = require("requests");

const app = express();
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates"));
hbs.registerPartials(path.join(__dirname, "../templates/partials"));

let data = {},
    temp = 0,
    tmin = 0,
    tmax = 0,
    main = "",
    desc = "",
    cname = "",
    ccode = "",
    message = "";

app.get("/", (req, res) => {
    res.render("views/main", {
        title: "Weather",
        temp: temp,
        tmin: tmin,
        tmax: tmax,
        main: main,
        desc: desc,
        cname: cname,
        ccode: ccode,
        message: message
    });
    message = "";
});

app.post("/", (req, res) => {
    try {
        requests(fs.readFileSync("../keys.txt") + req.body.daPlace).on("data", (chunk) => {
            //TODO process and send data via hbs.
            data = JSON.parse(chunk);
            
            console.log(data);
            if(data.message){
                message = data.message;
            }
            else{
                temp = `${Math.round(data.main.temp - 273.15)}°C`;
                tmin = `${Math.round(data.main.temp_min - 273.15)}°C`;
                tmax = `${Math.round(data.main.temp_max - 273.15)}°C`;
                main = data.weather[0].icon;
                desc = data.weather[0].description;
                cname = data.name;
                ccode = data.sys.country;
            }
            res.redirect("/");

        }).on("end", (err) => {
            if (err) {
                console.log("error fetching data");
                res.redirect("/");
            }
        });
    } catch (err) {
        console.log("Error: " + err);
    } finally {
        console.log("exceptions handled (if there were any)!");
    }


});

app.get("*", (req, res) => {
    res.send("<h1>404</h1>");
});

app.listen("3000", () => {
    console.log("Node at: 3000");
});