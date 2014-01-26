var http = require("http");
var cheerio = require("cheerio");
var fs = require("fs");

// Utility function that downloads a URL and invokes
// callback with the data.

function download(url, callback) {
    http.get(url, function(res) {
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}

var url = "http://pluralsight.com/training/Courses/CoursesContent";

//this array will hold all courses
var courses = [];

download(url, function(data) {
    if (data) {
        var $ = cheerio.load(data);

        //go through each course
        $("table.course tr").each(function(i, e) {


            var category = $(e).closest(" .courseList").prev().find(".title").text().trim();

            var titleLink = $(e).find(".title a");
            var name = titleLink.text().trim();
            var url = "http://www.pluralsight.com" + titleLink.attr("href").trim();
            var description = titleLink.attr("title").trim();

            var author = $(e).find("td.author a").text().trim();

            var level = $(e).find("td.level").text().trim();

            var hoursMinutesSeconds = $(e).find("td.duration").text().trim();
            var hours = parseInt(hoursMinutesSeconds.substring(1, 3));
            var minutes = parseInt(hoursMinutesSeconds.substring(4, 6));

            var duration = (hours * 60) + minutes;

            var rating = $(e).find("td.rating span").attr("title").substring(0, 3);

            var released = new Date($(e).find("td.releaseDate").text());

            //add course to array
            courses.push({
                category: category,
                name: name,
                url: url,
                description: description,
                author: author,
                level: level,
                duration: duration,
                rating: rating,
                released: released,
                users: []
            });
        });
    }

    //now that we have all the courses, write to js file:
    var outputFilename = '/courses.js';

    fs.writeFile(outputFilename, JSON.stringify(courses, null, 4), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("JSON saved to ");
        }
    });

    // console.log(courses.length);
    // console.log(courses[0].duration);

});
