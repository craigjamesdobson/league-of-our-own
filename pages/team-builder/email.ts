import type { Player } from "~/types/Player";
import type { PlayerPosition } from "~/types/PlayerPosition";

interface DraftedTeamPlayer {
    draftedPlayerID?: number;
    position: PlayerPosition;
    selectedPlayer: Player;
}

const generateTeamEmail = (players: DraftedTeamPlayer[], key: string) => {
    return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
 <meta charset="UTF-8" />
 <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
 <!--[if !mso]><!-- -->
 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
 <!--<![endif]-->
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <meta name="format-detection" content="telephone=no" />
 <meta name="format-detection" content="date=no" />
 <meta name="format-detection" content="address=no" />
 <meta name="format-detection" content="email=no" />
 <meta name="x-apple-disable-message-reformatting" />
 <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,400;0,600;0,700" rel="stylesheet" />
 <title>Untitled</title>
 <!-- Made with Postcards by Designmodo https://designmodo.com/postcards -->
 <style>
 html,
         body {
             margin: 0 !important;
             padding: 0 !important;
             min-height: 100% !important;
             width: 100% !important;
             -webkit-font-smoothing: antialiased;
         }
 
         * {
             -ms-text-size-adjust: 100%;
         }
 
         #outlook a {
             padding: 0;
         }
 
         .ReadMsgBody,
         .ExternalClass {
             width: 100%;
         }
 
         .ExternalClass,
         .ExternalClass p,
         .ExternalClass td,
         .ExternalClass div,
         .ExternalClass span,
         .ExternalClass font {
             line-height: 100%;
         }
 
         table,
         td,
         th {
             mso-table-lspace: 0 !important;
             mso-table-rspace: 0 !important;
             border-collapse: collapse;
         }
 
         u + .body table, u + .body td, u + .body th {
             will-change: transform;
         }
 
         body, td, th, p, div, li, a, span {
             -webkit-text-size-adjust: 100%;
             -ms-text-size-adjust: 100%;
             mso-line-height-rule: exactly;
         }
 
         img {
             border: 0;
             outline: 0;
             line-height: 100%;
             text-decoration: none;
             -ms-interpolation-mode: bicubic;
         }
 
         a[x-apple-data-detectors] {
             color: inherit !important;
             text-decoration: none !important;
         }
 
         .pc-gmail-fix {
             display: none;
             display: none !important;
         }
 
         .body .pc-project-body {
             background-color: transparent !important;
         }
 
         @media (min-width: 621px) {
             .pc-lg-hide {
                 display: none;
             } 
 
             .pc-lg-bg-img-hide {
                 background-image: none !important;
             }
         }
 </style>
 <style>
 @media (max-width: 620px) {
 .pc-project-body {min-width: 0px !important;}
 .pc-project-container {width: 100% !important;}
 .pc-sm-hide {display: none !important;}
 .pc-sm-bg-img-hide {background-image: none !important;}
 .pc-w620-width-300 {width: 300px !important;}
 .pc-w620-height-auto {height: auto !important;}
 .pc-w620-itemsSpacings-0-30 {padding-left: 0px !important;padding-right: 0px !important;padding-top: 15px !important;padding-bottom: 15px !important;}
 .pc-w620-padding-40-20-40-20 {padding: 40px 20px 40px 20px !important;}
 table.pc-w620-spacing-0-0-0-0 {margin: 0px 0px 0px 0px !important;}
 td.pc-w620-spacing-0-0-0-0,th.pc-w620-spacing-0-0-0-0{margin: 0 !important;padding: 0px 0px 0px 0px !important;}
 .pc-w620-fontSize-32px {font-size: 32px !important;}
 .pc-w620-fontSize-14px {font-size: 14px !important;}
 table.pc-w620-spacing-0-0-32-0 {margin: 0px 0px 32px 0px !important;}
 td.pc-w620-spacing-0-0-32-0,th.pc-w620-spacing-0-0-32-0{margin: 0 !important;padding: 0px 0px 32px 0px !important;}
 .pc-w620-padding-14-32-14-32 {padding: 14px 32px 14px 32px !important;}
 .pc-w620-fontSize-16px {font-size: 16px !important;}
 .pc-w620-padding-32-20-0-20 {padding: 32px 20px 0px 20px !important;}
 .pc-w620-lineHeight-140pc {line-height: 140% !important;}
 .pc-w620-padding-35-35-35-35 {padding: 35px 35px 35px 35px !important;}
 
 .pc-w620-gridCollapsed-1 > tbody,.pc-w620-gridCollapsed-1 > tbody > tr,.pc-w620-gridCollapsed-1 > tr {display: inline-block !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > tr > td,.pc-w620-gridCollapsed-1 > tr > td {display: block !important;width: auto !important;padding-left: 0 !important;padding-right: 0 !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-first > .pc-grid-td-first,pc-w620-gridCollapsed-1 > .pc-grid-tr-first > .pc-grid-td-first {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-last > .pc-grid-td-last,pc-w620-gridCollapsed-1 > .pc-grid-tr-last > .pc-grid-td-last {padding-bottom: 0 !important;}
 
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-first > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-first > td {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-last > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-last > td {padding-bottom: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-first,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-first {padding-left: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-last,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-last {padding-right: 0 !important;}
 
 .pc-w620-tableCollapsed-1 > tbody,.pc-w620-tableCollapsed-1 > tbody > tr,.pc-w620-tableCollapsed-1 > tr {display: block !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1 > tbody > tr > td,.pc-w620-tableCollapsed-1 > tr > td {display: block !important;width: auto !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 }
 @media (max-width: 520px) {
 .pc-w520-padding-30-30-30-30 {padding: 30px 30px 30px 30px !important;}
 }
 </style>
 <!--[if !mso]><!-- -->
 <style>
 @media all { @font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZFhjg.woff') format('woff'), url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZFhiA.woff2') format('woff2'); } @font-face { font-family: 'Inter'; font-style: normal; font-weight: 600; src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZFhjg.woff') format('woff'), url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZFhiA.woff2') format('woff2'); } @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZFhjg.woff') format('woff'), url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZFhiA.woff2') format('woff2'); } }
 </style>
 <!--<![endif]-->
 <!--[if mso]>
    <style type="text/css">
        .pc-font-alt {
            font-family: Arial, Helvetica, sans-serif !important;
        }
    </style>
    <![endif]-->
 <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
</head>

<body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; line-height: 1.5; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #ffffff;" bgcolor="#ffffff">
 <table class="pc-project-body" style="table-layout: fixed; min-width: 500px; background-color: #ffffff;" bgcolor="#ffffff" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
  <tr>
   <td align="center" valign="top">
    <table class="pc-project-container" style="width: 500px; max-width: 500px;" width="500" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
     <tr>
      <td style="padding: 20px 0px 20px 0px;" align="left" valign="top">
       <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="width: 100%;">
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Gift Card -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-32-20-0-20" style="padding: 30px 20px 0px 20px; border-radius: 20px 20px 0px 0px; background-color: #0b0c3d;" bgcolor="#0b0c3d">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td align="center" valign="top" style="padding: 0px 0px 32px 0px;">
                   <img src="https://cloudfilesdm.com/postcards/image-1718997585798.png" class="pc-w620-width-300 pc-w620-height-auto" width="2000" height="651" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width:2000px; height: auto; max-width: 100%; box-shadow: 0px 0px 0px 0px rgba(0,0,0,1);" />
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td>
                   <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                    <tr class="pc-grid-tr-first pc-grid-tr-last">
                     <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-30" align="left" valign="top" style="width: 100%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0; width: 100%;">
                       <tr>
                        <td class="pc-w620-padding-40-20-40-20" align="center" valign="middle" style="padding: 60px 40px 60px 40px; background-color: #ffffff; border-radius: 20px 20px 20px 20px;">
                         <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top" style="padding: 0px 0px 24px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt pc-w620-fontSize-32px" style="line-height: 120%; letter-spacing: -1px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 36px; font-weight: bold; font-variant-ligatures: normal; color: #27325e; text-align: center; text-align-last: center;">
                                   <div><span>Thank you for submission</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td valign="top" style="padding: 0px 0px 36px 0px;">
                               <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0;">
                                <tr>
                                 <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                                  <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 150%; letter-spacing: 0.1px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; font-variant-ligatures: normal; color: #27325e; text-align: center; text-align-last: center;">
                                   <div><span style="font-weight: 400;font-style: normal;color: var(--tw-prose-body);">Below is confirmation of your team. If you wish to make changes, click "Edit team" and you will be returned to the team builder where you can edit your team.</span>
                                   </div>
                                   <div><span>﻿</span>
                                   </div>
                                   <div><span style="font-weight: 700;font-style: normal;color: var(--tw-prose-body);">Thanks, Jim & Craig</span>
                                   </div>
                                  </div>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                             <tr>
                              <td valign="top" style="padding: 0px 0px 32px 0px;">
                               <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: auto;">
                                <tr>
                                 <!--[if gte mso 9]>
                    <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #e7e0e0;">&nbsp;</td>
                <![endif]-->
                                 <!--[if !gte mso 9]><!-- -->
                                 <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #e7e0e0;">&nbsp;</td>
                                 <!--<![endif]-->
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td style="padding: 0px 0px 20px 0px;">
                               <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-grid-td-last pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 0px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[0].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[0].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td style="padding: 0px 0px 20px 0px;">
                               <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 0px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[1].selectedPlayer.image_large}" class="" width="51" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[1].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[2].selectedPlayer.image_large}" class="" width="51" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[2].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[3].selectedPlayer.image_large}" class="" width="51" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[3].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[4].selectedPlayer.image_large}" class="" width="51" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[4].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td style="padding: 0px 0px 20px 0px;">
                               <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 0px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[5].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[5].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[6].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[6].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[7].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[7].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <td style="padding: 0px 0px 20px 0px;">
                               <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                <tr class="pc-grid-tr-first pc-grid-tr-last">
                                 <td class="pc-grid-td-first pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 0px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[8].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[8].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 20px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[9].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[9].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                 <td class="pc-grid-td-last pc-w620-itemsSpacings-0-30" align="center" valign="middle" style="width: 25%; padding-top: 0px; padding-right: 0px; padding-bottom: 0px; padding-left: 20px;">
                                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: separate; border-spacing: 0;">
                                   <tr>
                                    <td align="center" valign="middle">
                                     <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                      <tr>
                                       <td align="center" valign="top">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                         <tr>
                                          <td align="center" valign="top" style="padding: 0px 0px 10px 0px;">
                                           <img src="${players[10].selectedPlayer.image_large}" class="" width="60" height="auto" alt="" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 75px; height: auto;" />
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                      <tr>
                                       <td align="center" valign="top">
                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="border-collapse: separate; border-spacing: 0;">
                                         <tr>
                                          <td valign="top" align="center">
                                           <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 15px; font-weight: normal; font-variant-ligatures: normal; color: #333333; text-align: center; text-align-last: center;">
                                            <div><span>${players[10].selectedPlayer.web_name}</span>
                                            </div>
                                           </div>
                                          </td>
                                         </tr>
                                        </table>
                                       </td>
                                      </tr>
                                     </table>
                                    </td>
                                   </tr>
                                  </table>
                                 </td>
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                             <tr>
                              <td valign="top" style="padding: 0px 0px 32px 0px;">
                               <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: auto;">
                                <tr>
                                 <!--[if gte mso 9]>
                    <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #e7e0e0;">&nbsp;</td>
                <![endif]-->
                                 <!--[if !gte mso 9]><!-- -->
                                 <td height="1" valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #e7e0e0;">&nbsp;</td>
                                 <!--<![endif]-->
                                </tr>
                               </table>
                              </td>
                             </tr>
                            </table>
                           </td>
                          </tr>
                          <tr>
                           <td align="center" valign="top">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                             <tr>
                              <th valign="top" class="pc-w620-spacing-0-0-32-0" align="center" style="padding: 0px 0px 32px 0px; text-align: center; font-weight: normal; line-height: 1;">
                               <!--[if mso]>
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" width="50%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
            <tr>
                <td valign="middle" align="center" style="width: 50%; border-radius: 38px 38px 38px 38px; background-color: #0b0c3d; text-align:center; color: #ffffff; padding: 10px 20px 10px 20px; mso-padding-left-alt: 0; margin-left:20px;" bgcolor="#0b0c3d">
                                    <a class="pc-font-alt" style="display: inline-block; text-decoration: none; font-variant-ligatures: normal; font-family: 'Inter', Arial, Helvetica, sans-serif; font-weight: 600; font-size: 18px; line-height: 150%; letter-spacing: -0.2px; text-align: center; color: #ffffff;" href="https://designmodo.com/postcards/" target="_blank"><span style="display: block;"><span>Edit team</span></span></a>
                                </td>
            </tr>
        </table>
        <![endif]-->
                               <!--[if !mso]><!-- -->
                               <a class="pc-w620-fontSize-16px" style="display: inline-block; box-sizing: border-box; border-radius: 38px 38px 38px 38px; background-color: #0b0c3d; padding: 10px 20px 10px 20px; width: 50%; font-family: 'Inter', Arial, Helvetica, sans-serif; font-weight: 600; font-size: 18px; line-height: 150%; letter-spacing: -0.2px; color: #ffffff; vertical-align: top; text-align: center; text-align-last: center; text-decoration: none; -webkit-text-size-adjust: none;" href="https://leagueofourown.co.uk/team-builder?id=${key}" target="_blank"><span style="display: block;"><span>Edit team</span></span></a>
                               <!--<![endif]-->
                              </th>
                             </tr>
                            </table>
                           </td>
                          </tr>
                         </table>
                        </td>
                       </tr>
                      </table>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Gift Card -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Footer 7 -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td style="padding: 0px 0px 0px 0px;">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 40px 20px 40px 20px; border-radius: 0px 0px 20px 20px; background-color: #0b0c3d;" bgcolor="#0b0c3d">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td align="center" valign="top" style="padding: 0px 0px 4px 0px;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="border-collapse: separate; border-spacing: 0; margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" align="center" style="padding: 0px 0px 0px 0px;">
                      <div class="pc-font-alt pc-w620-lineHeight-140pc" style="line-height: 143%; letter-spacing: -0.2px; font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; font-variant-ligatures: normal; color: #ffffff; text-align: center; text-align-last: center;">
                       <div><span>If you have any issues, please </span><span style="font-weight: 700;font-style: normal;">contact us</span><span> and provide as much detail as possible.</span>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Footer 7 -->
         </td>
        </tr>
       </table>
      </td>
     </tr>
    </table>
   </td>
  </tr>
 </table>
 <!-- Fix for Gmail on iOS -->
 <div class="pc-gmail-fix" style="white-space: nowrap; font: 15px courier; line-height: 0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
 </div>
</body>

</html>
    `
}

export { generateTeamEmail }