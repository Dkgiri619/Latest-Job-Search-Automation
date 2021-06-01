const fs = require("fs");
const puppeteer = require("puppeteer");

const glassID = "gokot47302@itwbuy.com";
const glassPass = "gokot47302@itwbuy.com";
const searchKeyword = "Software Developer Engineer";
const place = "India";

let jobsData1 = [];


(async function glassdoor(){
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });
    let pages = await browser.pages();
    let tab = pages[0];
    // call all the other job sites
    await tab.goto("https://www.glassdoor.co.in/profile/login_input.htm?userOriginHook=HEADER_SIGNIN_LINK");
    await tab.waitForSelector(".gd-ui-button.minWidthBtn.css-8i7bc2");
    await tab.type("#userEmail",glassID);
    await tab.type("#userPassword", glassPass);
    await tab.click(".gd-ui-button.minWidthBtn.css-8i7bc2");
    await tab.waitForSelector(".content"); // to handle update your profile notification
    //await tab.waitForTimeout(10000);
    await tab.click(".member-header");
    //await tab.click("#sc\\.keyword");
    await tab.type("#sc\\.keyword", searchKeyword);
    await tab.click("#sc\\.location");
    await tab.keyboard.down("Control");
    await tab.keyboard.press("A");
    await tab.keyboard.up("Control");
    await tab.type("#sc\\.location", place);
    await tab.click("button[type='submit']");
    await tab.waitForSelector(".jobLink.eigr9kq2");
    let allJobTags = await tab.$$(".jobLink.eigr9kq2");
    let allJobLinks = [];
    for(let i=0;i<allJobTags.length;i++){
        let oneLink = await tab.evaluate( function(elem){ return elem.getAttribute("href"); }, allJobTags[i]);
        oneLink= "https://www.glassdoor.co.in"+oneLink;
        allJobLinks.push(oneLink);
    }
    await getJobData(allJobLinks[0],browser);
    // for(let i=0;i<allJobLinks.length;i++){
    //     await getJobData(allJobLinks[i], browser);
    //     ///console.log(allJobLinks[i]);
    // }

})();

async function getJobData(link, browser){
    let jobData = { company: '', designation: '', location: '', salary: '', link: ''};
    let tab = await browser.newPage();
    await tab.goto(link);
    // company name
    await tab.waitForSelector(".css-16nw49e.e11nt52q1");
    let nameTag = await tab.$(".css-16nw49e.e11nt52q1");
    let name = await tab.evaluate(function(elem){return elem.textContent},nameTag);
    let fName = name.slice(0, name.length-4);
    jobData[company]=fname;
    // location 
    let locTag = await tab.$(".css-1v5elnn.e11nt52q2");
    let loc = await tab.evaluate(function(elem){return elem.textContent},locTag);
    jobData[location] = loc;
    // designation
    let postTag  = await tab.$(".css-17x2pwl.e11nt52q6");
    let post = await tab.evaluate(function(elem){return elem.textContent},postTag);
    jobData[designation] = post;
    // salary
    const isSalaryPresent = await tab.$('.css-1v5elnn.e11nt52q2 .small'). then (res =>!! res);
    if(isSalaryPresent){
        let price = tab.evaluate(function(elem){}, isSalaryPresent)
    }
}
