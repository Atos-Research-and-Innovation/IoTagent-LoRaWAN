/**
  ******************************************************************************
  * @file    trace.c
  * @author  MCD Application Team
  * @brief   This file contains the Interface with BLE Drivers functions.
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2018 STMicroelectronics.
  * All rights reserved.</center></h2>
  *
  * This software component is licensed by ST under Ultimate Liberty license
  * SLA0044, the "License"; You may not use this file except in compliance with
  * the License. You may obtain a copy of the License at:
  *                             www.st.com/SLA0044
  *
  ******************************************************************************
  */

/* Includes ------------------------------------------------------------------*/
#include <stdint.h>
#include <string.h>
#include <stdarg.h>
#include "utilities.h"
#include "queue.h"
#include "trace.h"
#include "low_power_manager.h"
#include "debug.h"
/* Private typedef -----------------------------------------------------------*/
/* Private defines -----------------------------------------------------------*/
/* Private macros ------------------------------------------------------------*/

#define TEMPBUFSIZE 256

/* Private variables ---------------------------------------------------------*/
static queue_param_t MsgTraceQueue;
static uint8_t MsgTraceQueueBuff[DBG_TRACE_MSG_QUEUE_SIZE];

__IO ITStatus TracePeripheralReady = SET;

/* Private function prototypes -----------------------------------------------*/

/**
 * @brief  Trace buffer Transfer completed callback
 * @param  none
 * @note   Indicate the end of the transmission of a  trace buffer. If queue
 *         contains new trace data to transmit, start a new transmission.
 * @retval None
 */
static void Trace_TxCpltCallback(void);

/* Functions Definition ------------------------------------------------------*/
void TraceInit( void )
{
  OutputInit(Trace_TxCpltCallback);

  circular_queue_init(&MsgTraceQueue, MsgTraceQueueBuff, DBG_TRACE_MSG_QUEUE_SIZE);

  return;
}

int32_t TraceSend( const char *strFormat, ...)
{
  char buf[TEMPBUFSIZE];
  va_list vaArgs;
  uint8_t* buffer;
  va_start( vaArgs, strFormat);
  uint16_t bufSize=vsnprintf(buf,TEMPBUFSIZE,strFormat, vaArgs);
  va_end(vaArgs);
  int status=0;
  
  BACKUP_PRIMASK();
  
  DISABLE_IRQ(); /**< Disable all interrupts by setting PRIMASK bit on Cortex*/
  //DBG_GPIO_SET(GPIOB, GPIO_PIN_15);
  //DBG_GPIO_RST(GPIOB, GPIO_PIN_15);
  status =circular_queue_add(&MsgTraceQueue,(uint8_t*)buf, bufSize);
  
  if ((status==0 ) && (TracePeripheralReady==SET))
  {
    circular_queue_get(&MsgTraceQueue,&buffer,&bufSize);
    TracePeripheralReady = RESET;
    //DBG_GPIO_RST(GPIOB, GPIO_PIN_12);
    LPM_SetStopMode(LPM_UART_TX_Id , LPM_Disable );

    RESTORE_PRIMASK();
    OutputTrace(buffer, bufSize);
  }
  else
  {
    RESTORE_PRIMASK();
  }
  
  return status;
}

const char *TraceGetFileName(const char *fullpath)
{
  const char *ret = fullpath;

  if (strrchr(fullpath, '\\') != NULL)
  {
    ret = strrchr(fullpath, '\\') + 1;
  }
  else if (strrchr(fullpath, '/') != NULL)
  {
    ret = strrchr(fullpath, '/') + 1;
  }

  return ret;
}

/* Private Functions Definition ------------------------------------------------------*/

static void Trace_TxCpltCallback(void)
{
  int status;
  uint8_t* buffer;
  uint16_t bufSize;

  BACKUP_PRIMASK();

  DISABLE_IRQ(); /**< Disable all interrupts by setting PRIMASK bit on Cortex*/
  /* Remove element just sent to UART */
  circular_queue_remove(&MsgTraceQueue);
  //DBG_GPIO_SET(GPIOB, GPIO_PIN_13);
  //DBG_GPIO_RST(GPIOB, GPIO_PIN_13);
  /* Sense if new data to be sent */
  status=circular_queue_sense(&MsgTraceQueue);

  if ( status == 0) 
  {
    circular_queue_get(&MsgTraceQueue,&buffer,&bufSize);
    RESTORE_PRIMASK();
    //DBG_GPIO_SET(GPIOB, GPIO_PIN_14);
    //DBG_GPIO_RST(GPIOB, GPIO_PIN_14);
    OutputTrace(buffer, bufSize);
  }
  else
  {
    //DBG_GPIO_SET(GPIOB, GPIO_PIN_12);

    LPM_SetStopMode(LPM_UART_TX_Id , LPM_Enable );
    TracePeripheralReady = SET;
    RESTORE_PRIMASK();
  }
}

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
