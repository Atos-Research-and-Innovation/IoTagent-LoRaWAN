/**
  ******************************************************************************
  * @file    hw_conf.h
  * @author  MCD Application Team
  * @brief   contains hardware configuration Macros and Constants
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
#ifndef __HW_CONF_H__
#define __HW_CONF_H__

#ifdef __cplusplus
 extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/

#ifdef USE_STM32F0XX_NUCLEO
  #include "stm32f0xx_hal.h"
  #include "stm32f0xx_nucleo.h"
  #include "stm32f0xx_hal_conf.h"
  #error "create stm32f0xx_hw_conf.h "
#endif

#ifdef USE_STM32F1XX_NUCLEO
  #include "stm32f1xx_hal.h"
  #include "stm32f1xx_nucleo.h"
  #include "stm32f1xx_hal_conf.h"
  #error "create stm32f1xx_hw_conf.h "
#endif

#ifdef USE_STM32F3XX_NUCLEO
  #include "stm32f3xx_hal.h"
  #include "stm32f3xx_nucleo.h"
  #include "stm32f3xx_hal_conf.h"
  #error "create stm32f3xx_hw_conf.h "
#endif

#ifdef USE_STM32F4XX_NUCLEO
  #include "stm32f4xx_hal.h"
  #include "stm32f4xx_nucleo.h"
  #include "stm32f4xx_hal_conf.h"
  #error "create stm32f4xx_hw_conf.h "
#endif

#ifdef USE_STM32L0XX_NUCLEO
  #include "stm32l0xx_hal.h"
  #include "stm32l0xx_nucleo.h"
  #include "stm32l0xx_hal_conf.h"
  #include "stm32l0xx_hw_conf.h"
#endif

#ifdef USE_STM32L1XX_NUCLEO
  #include "stm32l1xx_hal.h"
  #include "stm32l1xx_nucleo.h"
  #include "stm32l1xx_hal_conf.h"
  #include "stm32l1xx_hw_conf.h"
#endif

#ifdef USE_STM32L4XX_NUCLEO
  #include "stm32l4xx_hal.h"
  #include "stm32l4xx_nucleo.h"
  #include "stm32l4xx_hal_conf.h"
  #include "stm32l4xx_hw_conf.h"
#endif

#ifdef USE_B_L072Z_LRWAN1
  #include "stm32l0xx_hal.h"
  #include "b-l072z-lrwan1.h"
  #include "stm32l0xx_hal_conf.h"
  #include "mlm32l0xx_hw_conf.h"
#endif

/* --------Preprocessor compile swicth------------ */
/* debug swicth in debug.h */
//#define DEBUG
   
/* uncomment below line to never enter lowpower modes in main.c*/
//#define LOW_POWER_DISABLE

/* debug swicthes in bsp.c */
//#define SENSOR_ENABLED
   
   
/* Exported types ------------------------------------------------------------*/
/* Exported constants --------------------------------------------------------*/

#ifdef __cplusplus
}
#endif

#endif /* __HW_CONF_H__ */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
