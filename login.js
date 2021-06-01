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
    await tab.waitForSelector(".autocomplete-suggestions span"); // wait for suggestion
    await tab.click(".autocomplete-suggestions span");
    await tab.click("button[type='submit']");
    await tab.waitForSelector(".jobLink.eigr9kq2");
    let allJobTags = await tab.$$(".jobLink.eigr9kq2");
    let allJobLinks = [];
    for(let i=0;i<allJobTags.length;i++){
        let oneLink = await tab.evaluate( function(elem){ return elem.getAttribute("href"); }, allJobTags[i]);
        oneLink= "https://www.glassdoor.co.in"+oneLink;
        allJobLinks.push(oneLink);
    }
    //await getJobData(allJobLinks[3],browser);
    for(let i=0;i<allJobLinks.length;i++){
        let newTab = await browser.newPage();
        await getJobData(allJobLinks[i], newTab);
    }

})();

async function getJobData(link, tab){
    let jobData = { "company": '', "designation": '', "location": '', "salary": '', "link": ''};
    await tab.goto(link);
    // company name
    await tab.waitForSelector(".css-16nw49e.e11nt52q1");
    let nameTag = await tab.$(".css-16nw49e.e11nt52q1");
    let name = await tab.evaluate(function(elem){return elem.textContent},nameTag);
    let fName = name.slice(0, name.length-4);
    jobData["company"]=fName;
    // location 
    let locTag = await tab.$(".css-1v5elnn.e11nt52q2");
    let loc = await tab.evaluate(function(elem){return elem.textContent},locTag);
    jobData["location"] = loc;
    // designation
    let postTag  = await tab.$(".css-17x2pwl.e11nt52q6");
    let post = await tab.evaluate(function(elem){return elem.textContent},postTag);
    jobData["designation"] = post;
    // salary
    const isSalaryPresent = await tab.$('.css-1v5elnn.e11nt52q2 .small')
    if(isSalaryPresent!=null){
        let price = await tab.evaluate(function(elem){return elem.textContent}, isSalaryPresent);
        jobData["salary"]=price;
    }else jobData["salary"]="not specified";
    // job link
    const isJobPresent = await tab.$('.gd-ui-button.applyButton.e1ulk49s0.css-1m0gkmt')
    if(isJobPresent!=null){
        let joblink = await tab.evaluate(function(elem){return elem.getAttribute("href")}, isJobPresent);
        joblink = "https://www.glassdoor.co.in" + joblink;
        jobData["link"]=joblink;
    }else {
        let linkTag = await tab.$(".indeed-apply-status-not-applied");
        let joblink = await tab.evaluate(function(elem){return elem.dataset.indeedApplyJoburl},linkTag);
        jobData["link"]=joblink;
    }
    console.log(jobData);
    tab.close();
}
