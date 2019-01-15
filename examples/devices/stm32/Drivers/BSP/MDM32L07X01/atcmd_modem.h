/**
  ******************************************************************************
  * @file    atcmd_modem.h
  * @author  MCD Application Team
  * @brief   Header for AT commands definition 
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2018 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under BSD 3-Clause license,
  * the "License"; You may not use this file except in compliance with the
  * License. You may obtain a copy of the License at:
  *                        opensource.org/licenses/BSD-3-Clause
  *
  ******************************************************************************
  */

#ifndef __ATCMD_MODEM_H__
#define __ATCMD_MODEM_H__

#ifdef __cplusplus
 extern "C" {
#endif 


  /******************************************************************************************/ 
  /*    AT commands specifications for Murata modem  (B-L072Z-LRWAN1 Discovery board)       */
  /*               - set of commands                                                        */
  /*               - return code error                                                      */
  /******************************************************************************************/


#ifdef AT_CMD_INDEX
/*
 * AT Command Index located in "atcmd.h" file.
 * In direct relationship with "CmdTab" static array located in atcmd.c file
 */

typedef enum ATCmd
{
 AT, 
 AT_RESET,   
 AT_JOIN,    
 AT_NJS,     
 AT_DEUI,          
 AT_DADDR,         
 AT_APPKEY,        
 AT_NWKSKEY,         
 AT_APPSKEY,         
 AT_APPEUI,          
 AT_ADR,     
 AT_TXP,     
 AT_DR,      
 AT_DCS,             
 AT_PNM,             
 AT_RX2FQ,   
 AT_RX2DR,   
 AT_RX1DL,           
 AT_RX2DL,           
 AT_JN1DL,           
 AT_JN2DL,           
 AT_NJM,     
 AT_NWKID,           
 AT_FCU,             
 AT_FCD,             
 AT_CLASS,           
 AT_SENDB,   
 AT_SEND,    
 AT_RECVB,   
 AT_RECV,
 AT_CFM,
 AT_CFS,
 AT_BAT,
 AT_RSSI,
 AT_SNR,
 AT_VER,
 AT_END_AT
} ATCmd_t; 

#endif

#ifdef AT_CMD_STRING
/*
 * list of AT string cmd supported by the B-L072Z-LRWAN1 Discovery board
 * Located in atcmd.c file
 */



static char *CmdTab[] = { 
  "",
  "Z",
  "+JOIN",       /* +JOIN*/
  "+NJS",        /* +NJS*/
  "+DEUI",       /* +DEUI device ID*/
  "+DADDR",      /* +DADDR device Address*/
  "+APPKEY",     /* +APPKEY application key*/
  "+NWKSKEY",    /* +NWKSKEY Network session Key*/
  "+APPSKEY",    /* +APPSKEY application Session key*/
  "+APPEUI",     /* +APPEUI application Identifier*/
  "+ADR",        /* +ADR adaptive data rate*/
  "+TXP",        /* +TXP transmit Tx power*/
  "+DR",         /* +DR data rate*/
  "+DCS",        /* +DCS duty cycle settings*/
  "+PNM",        /* +PNM public network*/
  "+RX2FQ",      /* +RF2FQ Rx2 window frequency*/
  "+RX2DR",      /* +RX2DR data rate of Rx window*/
  "+RX1DL",      /* +RX1DL Delay of the Rx1 window*/
  "+RX2DL",      /* +RX2DL delay of the Rx2 window*/
  "+JN1DL",      /* +JN1DL Join delay on Rx Wind 1*/
  "+JN2DL",      /* +JN2DL Join delay on Rx Wind 2*/
  "+NJM",        /* +NJM Nwk Join Mode*/
  "+NWKID",      /* +NWKID Network ID */
  "+FCU",        /* +FCU uplink frame counter */
  "+FCD",        /* +FCD downlink frame counter */ 
  "+CLASS",      /* +CLASS LoRa class*/
  "+SENDB",      /* +SENDB send data binary format*/
  "+SEND",       /* +SEND send data in raw format*/
  "+RECVB",      /* +RECVB received data in binary format*/
  "+RECV",       /* +RECV received data in raw format*/
  "+CFM",        /* +CFM  confirmation mode*/
  "+CFS",        /* +CFS  confirm status*/
  "+BAT",        /* +BAT  battery level*/
  "+RSSI",       /* +RSSI Signal strength indicator on received radio signal*/
  "+SNR",        /* +SNR  Signal to Noice ratio*/
  "+VER"         /* firmware version of the modem (slave)*/
};

#endif



#ifdef AT_ERROR_INDEX
/*
 * AT Command Index errors, located in atcmd.h file. in at In direct relationship with ATE_RetCode static array
 * in atcmd.c file
 */


typedef enum eATEerror
{
  AT_OK = 0,
  AT_ERROR,
  AT_PARAM_ERROR,
  AT_CMD_ERROR,
  AT_BUSY_ERROR,
  AT_TEST_PARAM_OVERFLOW,
  AT_NOT_SUPPORTED,
  AT_NO_NET_JOINED,
  AT_END_ERROR,
  AT_UART_LINK_ERROR,    /*additional return code to notify error on UART link*/
  AT_JOIN_SLEEP_TRANSITION, /*additional return code to manage the Join request transaction*/  
} ATEerror_t;

#endif

#ifdef AT_ERROR_STRING
/*
 * RetCode used to compare the return code from modem. Located in atcmd.c file
 * In direct relation with ATE_RetCode_t
 */ 
static ATE_RetCode_t ATE_RetCode[] = {
  {"\r\nOK\r\n",sizeof("\r\nOK\r\n"),AT_OK},
  {"\r\nAT_ERROR\r\n",sizeof("\r\nAT_ERROR\r\n"),AT_ERROR},
  {"\r\nAT_PARAM_ERROR\r\n",sizeof("\r\nAT_PARAM_ERROR\r\n"),AT_PARAM_ERROR},  
  {"\r\nAT_CMD_ERROR\r\n",sizeof("\r\nAT_CMD_ERROR\r\n"),AT_CMD_ERROR},
  {"\r\nAT_BUSY_ERROR\r\n",sizeof("\r\nAT_BUSY_ERROR\r\n"),AT_BUSY_ERROR},  
  {"\r\nAT_TEST_PARAM_OVERFLOW\r\n",sizeof("\r\nAT_TEST_PARAM_OVERFLOW\r\n"),AT_TEST_PARAM_OVERFLOW},
  {"\r\nAT_NOT_SUPPORTED\r\n",sizeof("\r\nAT_NOT_SUPPORTED\r\n"),AT_NOT_SUPPORTED},
  {"\r\nAT_NO_NETWORK_JOINED\r\n",sizeof("\r\nAT_NO_NETWORK_JOINED\r\n"),AT_NO_NET_JOINED},
  {"\r\nunknown error\r\n",sizeof("\r\nunknown error\r\n"),AT_END_ERROR}};

#endif

  
  
#ifdef AT_CMD_MARKER 
 

/* 
 * Marker to design the AT command string for the B-L072Z-LRWAN1 Discovery board
 * Located in atcmd.h file.
 */  
#define AT_HEADER       "AT"
#define AT_SET_MARKER   "="
#define AT_GET_MARKER   "=?"
#define AT_NULL_MARKER   ""
#define AT_COLON        ":" 
#define AT_SEPARATOR    ":" 
#define AT_FRAME_KEY    "%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx:%hhx"
#define AT_FRAME_KEY_OFFSET 0  
#endif
  

#ifdef __cplusplus
}
#endif

#endif /*__ATCMD_MODEM_H__*/

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
