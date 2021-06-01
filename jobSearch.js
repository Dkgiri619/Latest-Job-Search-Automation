const searchKeyword = "Software Developer Engineer"; //changeme
const place = "India"; //changeme, a valid location 
const fs = require("fs");
const puppeteer = require("puppeteer");
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
    tab.close();
}
