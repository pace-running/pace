/* jshint node: true */
'use strict';
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Q = require('q');
const config = require('config');
var Archiver = require('archiver');

const qr = require('qr-image');

let pdfGeneration = {};

let createOutputDir = () => {
  let dir = config.get('pdfPath');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
};

const pathToBackgroundImage = '/images/background_light.jpg';
const pathToLogoLeft = '/images/lauf_gegen_rechts_logo.jpg';
const pathToLogoRight = '/images/fc_st_pauli_marathon_logo.png';
const checkmarkSymbolSvg = 'M7.375,25 c0,0,10,11.375,14.125,11.375S44.875,8,44.875,8';

pdfGeneration.addCheckmarkSymbol = (doc) => {
  doc.translate(12, 20)
    .path(checkmarkSymbolSvg)
    .lineWidth(3)
    .stroke();
};

pdfGeneration.addQrCodeWithSelfServiceLink = (doc, selfServiceUrl) => {
  doc.fontSize(10).fillColor('white').text('Registriere dich', 120, 365);
  doc.fontSize(10).fillColor('white').text('nach dem Lauf', 120, 376);
  doc.fontSize(10).fillColor('white').text('unter diesem Link', 120, 387);
  doc.rect(20,310,86,86).fill('white');
  doc.scale(2)
    .translate(10, 155)
    .path(qr.svgObject(selfServiceUrl).path)
    .fill('black', 'even-odd');
};

pdfGeneration.generate = (startNumberData) => {
  let doc = new PDFDocument({size: 'A5', layout: 'landscape', margin: 0});
  createOutputDir();
  let pdfPath = `${config.get('pdfPath')}${startNumberData.startNumber}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));
  pdfGeneration.createStartNumberPage(doc, startNumberData);
  doc.end();
  console.log('start_number pdf stored: %s',pdfPath);
};

pdfGeneration.createStartNumberPage = (doc, startNumberData) => {

  doc.image(__dirname + pathToBackgroundImage,{width:595.28 });
  //  doc.image(__dirname + pathToLogoLeft, 20, 20, {fit: [100, 100]});
  doc.image(__dirname + pathToLogoRight, 475, 10, {fit: [100, 100]});

  doc.font('Helvetica-Bold').fontSize(200).fillColor(startNumberData.startBlockColor).text(startNumberData.startNumber, 0, 100, {align: 'center'});
  doc.fontSize(30).fillColor('white').text(startNumberData.firstname.substring(0, 17)+ ' - ' + startNumberData.team.substring(0,25), 0, 370, {align: 'center'});
  console.log(startNumberData.startBlockColor);

  doc.fontSize(35).fillColor(startNumberData.startBlockColor).text('Startblock: '+startNumberData.startBlock, 200, 20, {align: 'left'});

  if(startNumberData.tshirt) {
    doc.fontSize(12).fillColor('black').text(startNumberData.tshirt.size + ' ' + startNumberData.tshirt.model, 10, 10);
  }

  if(startNumberData.hasPayed) {
    pdfGeneration.addCheckmarkSymbol(doc);
  }

  if(startNumberData.onSiteRegistration) {
    pdfGeneration.addQrCodeWithSelfServiceLink(doc, startNumberData.secureUrl);
  }
};

pdfGeneration.zip = (res) => {
    var zip = Archiver('zip');
    createOutputDir();
    zip.pipe(res);
    zip.on('error', function(err) {
      console.log(err)
    })
    zip.glob(`${config.get('pdfPath')}/*.pdf`);
    zip.finalize();
  }

module.exports = pdfGeneration;
