/*
 / _____)             _              | |
( (____  _____ ____ _| |_ _____  ____| |__
 \____ \| ___ |    (_   _) ___ |/ ___)  _ \
 _____) ) ____| | | || |_| ____( (___| | | |
(______/|_____)_|_|_| \__)_____)\____)_| |_|
    (C)2013 Semtech

Description: SX1272 driver specific target board functions implementation

License: Revised BSD License, see LICENSE.TXT file include in the project

Maintainer: Miguel Luis and Gregory Cristian
*/
/**
  ******************************************************************************
  * @file    sx1272mb2das.c
  * @author  MCD Application Team
  * @brief   driver sx1272 board ( sx1272mb2das )
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
#ifndef __SX1272MB2DAS__
#define __SX1272MB2DAS__

#ifdef __cplusplus
 extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
/* Exported types ------------------------------------------------------------*/
/* Exported constants --------------------------------------------------------*/

#define BOARD_WAKEUP_TIME  0 // no TCXO

/* Exported functions ------------------------------------------------------- */ 

/*!
 * \brief Initializes the radio I/Os pins interface
 */
void SX1272IoInit( void );


/*!
 * \brief De-initializes the radio I/Os pins interface.
 *
 * \remark Useful when going in MCU low power modes
 */
void SX1272IoDeInit( void );

/*!
 * \brief Checks if the given RF frequency is supported by the hardware
 *
 * \param [IN] frequency RF frequency to be checked
 * \retval isSupported [true: supported, false: unsupported]
 */
bool SX1272CheckRfFrequency( uint32_t frequency );

/*!
 * Radio hardware and global parameters
 */
extern SX1272_t SX1272;

#ifdef __cplusplus
}
#endif

#endif /* __SX1272MB2DAS__ */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
