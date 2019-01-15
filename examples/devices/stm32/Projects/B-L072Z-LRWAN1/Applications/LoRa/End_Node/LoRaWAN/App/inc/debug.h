/**
  ******************************************************************************
  * @file    debug.h
  * @author  MCD Application Team
  * @brief   Header for driver debug.c module
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

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __DEBUG_H__
#define __DEBUG_H__

#ifdef __cplusplus
 extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/



#include <string.h>
#include <stdio.h>
#include "hw_conf.h"

/* Exported types ------------------------------------------------------------*/
/* Exported constants --------------------------------------------------------*/
/* External variables --------------------------------------------------------*/
/* Exported macros -----------------------------------------------------------*/
/* Exported functions ------------------------------------------------------- */ 

void DBG_Init( void );

void Error_Handler( void );

#ifdef DEBUG

#define DBG_GPIO_WRITE( gpio, n, x )  HAL_GPIO_WritePin( gpio, n, (GPIO_PinState)(x) )

#define DBG_GPIO_SET( gpio, n )       gpio->BSRR = n

#define DBG_GPIO_RST( gpio, n )       gpio->BRR = n 

#define DBG_RTC_OUTPUT RTC_OUTPUT_DISABLE; /* RTC_OUTPUT_ALARMA on PC13 */

#define DBG( x )  do{ x } while(0)

#else /* DEBUG */

#define DBG_GPIO_WRITE( gpio, n, x )

#define DBG_GPIO_SET( gpio, n )

#define DBG_GPIO_RST( gpio, n )

#define DBG( x ) do{  } while(0)
                      
#define DBG_RTC_OUTPUT RTC_OUTPUT_DISABLE;

#endif /* DEBUG */

#ifdef __cplusplus
}
#endif

#endif /* __DEBUG_H__*/

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
