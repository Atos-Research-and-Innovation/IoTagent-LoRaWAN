/*
 / _____)             _              | |
( (____  _____ ____ _| |_ _____  ____| |__
 \____ \| ___ |    (_   _) ___ |/ ___)  _ \
 _____) ) ____| | | || |_| ____( (___| | | |
(______/|_____)_|_|_| \__)_____)\____)_| |_|
    (C)2013 Semtech

Description: Generic SX1276mb1mas driver implementation

License: Revised BSD License, see LICENSE.TXT file include in the project

Maintainer: Miguel Luis and Gregory Cristian
*/
/**
  *******************************************************************************
  * @file    mlm32l07x01.h
  * @author  MCD Application Team
  * @brief   driver LoRa module murata cmwx1zzabz-091
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

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __MLM32L07X01_H__
#define __MLM32L07X01_H__

#ifdef __cplusplus
 extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
/* Exported types ------------------------------------------------------------*/
/* Exported constants --------------------------------------------------------*/

#define BOARD_WAKEUP_TIME  5 //TCXO





#define RF_MID_BAND_THRESH                          525000000

/* Exported functions ------------------------------------------------------- */ 

/*!
 * \brief Initializes the radio I/Os pins interface
 */
void SX1276IoInit( void );


/*!
 * \brief De-initializes the radio I/Os pins interface. 
 *
 * \remark Useful when going in MCU lowpower modes
 */
void SX1276IoDeInit( void );

/*!
 * \brief Checks if the given RF frequency is supported by the hardware
 *
 * \param [IN] frequency RF frequency to be checked
 * \retval isSupported [true: supported, false: unsupported]
 */
bool SX1276CheckRfFrequency( uint32_t frequency );


/*!
 * \brief set RF output power
 *
 * \param [IN] power in dBm
 * \retval Nonce
 */
void SX1276SetRfTxPower( int8_t power );

#ifdef __cplusplus
}
#endif

#endif /* __MLM32L07X01_H__*/

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
