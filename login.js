const fs = require("fs");
const puppeteer = require("puppeteer");
// for glassdoor we need a valid id and pass first
const glassID = "gokot47302@itwbuy.com"; // changeme
const glassPass = "gokot47302@itwbuy.com"; //changeme
const searchKeyword = "Software Developer Engineer"; //changeme
const place = "India"; //changeme, a valid location 

let jobsData1 = [];

//glassdoor platform
(async function glassdoor(){
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
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
    await fs.promises.writeFile("jobs.json", JSON.stringify(jobsData1));
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
        price = price.slice(0, price.length-17);
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
    jobsData1.push(jobData);
    console.log(`--------------------------${jobData["company"]}---${jobData["designation"]}---------------`);
    tab.close();
}

// indeed platform
(async function indeed(){
    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    })
    let pages = await browser.pages();
    let tab = pages[0];
    await tab.goto("https://in.indeed.com/");
    await tab.waitForSelector("input[placeholder='Job title, keywords, or company']");
    await tab.type("input[placeholder='Job title, keywords, or company']", searchKeyword);
    await tab.click("input[placeholder='City, state, or pin code']")
    await tab.keyboard.down("Control");
    await tab.keyboard.press("A");
    await tab.keyboard.up("Control");
    await tab.type("input[placeholder='City, state, or pin code']", place);
    await tab.click(".icl-Button--md.icl-WhatWhere-button");
    await tab.waitForSelector(".row.result.clickcard .title a");
    let allJobsTags = await tab.$$(".row.result.clickcard .title a");
    let allJobLinks = [];
    for(let i=0;i< allJobsTags.length;i++){
        let oneLink = await tab.evaluate(function(elem){return elem.getAttribute("href");},allJobsTags[i]);
        oneLink = "https://in.indeed.com" + oneLink;
        allJobLinks.push(oneLink);
    }

    console.log(allJobLinks.length);
    for(let i=0;i<allJobLinks.length;i++){
        let newTab = await browser.newPage();
        await getJobDataIndeed(newTab, allJobLinks[i]);
    }
})();

async function getJobDataIndeed(tab, link){
    let jobData = { "company": '', "designation": '', "location": '', "salary": '', "link": ''};
    await tab.goto(link);
    await tab.waitForSelector(".icl-u-lg-mr--sm.icl-u-xs-mr--xs");
    // company name
    let cnameTag = await tab.$(".icl-u-lg-mr--sm.icl-u-xs-mr--xs");
    let cName = await tab.evaluate(function(elem){return elem.textContent},cnameTag);
    jobData["company"]=cName;
    // location 
    let allocTag  = await tab.$$(".jobsearch-JobInfoHeader-subtitle.jobsearch-DesktopStickyContainer-subtitle div");
    let loc = await tab.evaluate(function(elem){return elem.textContent},allocTag[2]);
    jobData["location"]=loc;
    // salary
    const priceTag = await tab.$(".jobsearch-JobMetadataHeader-item  .icl-u-xs-mr--xs");
    if(priceTag!=null){
        let price = await tab.evaluate(function(elem){return elem.textContent},priceTag);
        jobData["salary"]=price;
    }else jobData["salary"]= "not specified";
    //console.log(jobData);
    // designation 
    let posTag = await tab.$(".icl-u-xs-mt--none.jobsearch-JobInfoHeader-title");
    let pos = await tab.evaluate(function(elem){return elem.textContent}, posTag);
    jobData["designation"]=pos;
    // job link
    const linkTag = await tab.$("#applyButtonLinkContainer .icl-u-xs-hide.icl-u-lg-block.icl-u-lg-textCenter a");
    if(linkTag!=null){
        let fLink = await tab.evaluate(function(ele){return ele.getAttribute("href")},linkTag);
        jobData["link"] = fLink;
    }else jobData["link"]=link;
    console.log(`[+]  ${jobData["company"]}(${jobData["designation"]})    `);
    jobsData1.push(jobData);
    tab.close();
}
