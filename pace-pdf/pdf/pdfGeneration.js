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
  doc.translate(20, 280)
    .path(checkmarkSymbolSvg)
    .lineWidth(3)
    .stroke();
};

pdfGeneration.addQrCodeWithSelfServiceLink = (doc, selfServiceUrl) => {
  doc.fontSize(10).fillColor('black').text('Registriere dich', 300, 320);
  doc.fontSize(10).fillColor('black').text('nach dem Lauf', 300, 330);
  doc.fontSize(10).fillColor('black').text('unter diesem Link', 300, 340);

  doc.scale(2)
    .translate(100, 150)
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

  doc.image(__dirname + pathToBackgroundImage, {fit: [800, 800]});
  //  doc.image(__dirname + pathToLogoLeft, 20, 20, {fit: [100, 100]});
  doc.image(__dirname + pathToLogoRight, 475, 20, {fit: [100, 100]});

  doc.font('Helvetica-Bold').fontSize(200).fillColor('saddlebrown').text(startNumberData.startNumber, 0, 130, {align: 'center'});
  doc.fontSize(40).fillColor('red').text(startNumberData.firstname.substring(0, 17), 0, 300, {align: 'center'});
  doc.fontSize(30).fillColor('red').text(startNumberData.team.substring(0, 25), 0, 350, {align: 'center'});
  console.log(startNumberData.startBlockColor);

  doc.fontSize(35).fillColor(startNumberData.startBlockColor).text('Startblock: '+startNumberData.startBlock, 200, 20, {align: 'left'});

  if(startNumberData.tshirt) {
    doc.fontSize(12).fillColor('black').text(startNumberData.tshirt.size + ' ' + startNumberData.tshirt.model, 500, 315);
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
