 /*
 / _____)             _              | |
( (____  _____ ____ _| |_ _____  ____| |__
 \____ \| ___ |    (_   _) ___ |/ ___)  _ \
 _____) ) ____| | | || |_| ____( (___| | | |
(______/|_____)_|_|_| \__)_____)\____)_| |_|
    (C)2013 Semtech

Description: LoRaMac classA device implementation

License: Revised BSD License, see LICENSE.TXT file include in the project

Maintainer: Miguel Luis, Gregory Cristian and Wael Guibene
*/
/**
  ******************************************************************************
  * @file    version.h
  * @author  MCD Application Team
  * @brief   defines the lora mac version
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

#ifndef __VERSION_H__
#define __VERSION_H__

#ifdef __cplusplus
extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
#include "lora_mac_version.h"
/* Exported constants --------------------------------------------------------*/
#define TEST_VERSION (uint32_t) 0x00000000  /*1 lsb is always 0 in releases   */
#define LRWAN_VERSION  (uint32_t) 0x00001210  /*3 next hex is i_cube release*/
#define VERSION   (uint32_t) ( LORA_MAC_VERSION | LRWAN_VERSION | TEST_VERSION )
   
/* Exported types ------------------------------------------------------------*/
/* External variables --------------------------------------------------------*/
/* Exported macros -----------------------------------------------------------*/
/* Exported functions ------------------------------------------------------- */

#ifdef __cplusplus
}
#endif

#endif /*__VERSION_H__*/

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
