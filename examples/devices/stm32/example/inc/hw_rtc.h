/*
 / _____)             _              | |
( (____  _____ ____ _| |_ _____  ____| |__
 \____ \| ___ |    (_   _) ___ |/ ___)  _ \
 _____) ) ____| | | || |_| ____( (___| | | |
(______/|_____)_|_|_| \__)_____)\____)_| |_|
    (C)2013 Semtech

Description: Bleeper board GPIO driver implementation

License: Revised BSD License, see LICENSE.TXT file include in the project

Maintainer: Miguel Luis and Gregory Cristian
*/
 /******************************************************************************
  * @file    hw_rtc.h
  * @author  MCD Application Team
  * @version V1.1.5
  * @date    30-March-2018
  * @brief   Header for driver hw_rtc.c module
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2017 STMicroelectronics International N.V. 
  * All rights reserved.</center></h2>
  *
  * Redistribution and use in source and binary forms, with or without 
  * modification, are permitted, provided that the following conditions are met:
  *
  * 1. Redistribution of source code must retain the above copyright notice, 
  *    this list of conditions and the following disclaimer.
  * 2. Redistributions in binary form must reproduce the above copyright notice,
  *    this list of conditions and the following disclaimer in the documentation
  *    and/or other materials provided with the distribution.
  * 3. Neither the name of STMicroelectronics nor the names of other 
  *    contributors to this software may be used to endorse or promote products 
  *    derived from this software without specific written permission.
  * 4. This software, including modifications and/or derivative works of this 
  *    software, must execute solely and exclusively on microcontroller or
  *    microprocessor devices manufactured by or for STMicroelectronics.
  * 5. Redistribution and use of this software other than as permitted under 
  *    this license is void and will automatically terminate your rights under 
  *    this license. 
  *
  * THIS SOFTWARE IS PROVIDED BY STMICROELECTRONICS AND CONTRIBUTORS "AS IS" 
  * AND ANY EXPRESS, IMPLIED OR STATUTORY WARRANTIES, INCLUDING, BUT NOT 
  * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
  * PARTICULAR PURPOSE AND NON-INFRINGEMENT OF THIRD PARTY INTELLECTUAL PROPERTY
  * RIGHTS ARE DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY LAW. IN NO EVENT 
  * SHALL STMICROELECTRONICS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
  * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, 
  * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
  * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
  * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
  * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  *
  ******************************************************************************
  */

#ifndef __HW_RTC_H__
#define __HW_RTC_H__

#ifdef __cplusplus
 extern "C" {
#endif

/* Includes ------------------------------------------------------------------*/
#include "utilities.h"
   
/* Exported types ------------------------------------------------------------*/
/* Exported constants --------------------------------------------------------*/
/* External variables --------------------------------------------------------*/
/* Exported macros -----------------------------------------------------------*/
/* Exported functions ------------------------------------------------------- */ 

/*!
 * @brief Initializes the RTC timer
 * @note The timer is based on the RTC
 * @param none
 * @retval none
 */
void HW_RTC_Init( void );

/*!
 * @brief Stop the Alarm
 * @param none
 * @retval none
 */
void HW_RTC_StopAlarm( void );

/*!
 * @brief Return the minimum timeout the RTC is able to handle
 * @param none
 * @retval minimum value for a timeout
 */
uint32_t HW_RTC_GetMinimumTimeout( void );

/*!
 * @brief Set the alarm
 * @note The alarm is set at Reference + timeout
 * @param timeout Duration of the Timer in ticks
 */
void HW_RTC_SetAlarm( uint32_t timeout );

/*!
 * @brief Get the RTC timer elapsed time since the last Reference was set
 * @retval RTC Elapsed time in ticks
 */
uint32_t HW_RTC_GetTimerElapsedTime( void );

/*!
 * @brief Get the RTC timer value
 * @retval none
 */
uint32_t HW_RTC_GetTimerValue( void );

/*!
 * @brief Set the RTC timer Reference
 * @retval  Timer Reference Value in  Ticks
 */
uint32_t HW_RTC_SetTimerContext( void );
  
/*!
 * @brief Get the RTC timer Reference
 * @retval Timer Value in  Ticks
 */
uint32_t HW_RTC_GetTimerContext( void );
/*!
 * @brief RTC IRQ Handler on the RTC Alarm
 * @param none
 * @retval none
 */
void HW_RTC_IrqHandler ( void );

/*!
 * @brief a delay of delay ms by polling RTC
 * @param delay in ms
 * @param none
 * @retval none
 */
void HW_RTC_DelayMs( uint32_t delay );

/*!
 * @brief calculates the wake up time between wake up and mcu start
 * @note resolution in RTC_ALARM_TIME_BASE
 * @param none
 * @retval none
 */
void HW_RTC_setMcuWakeUpTime( void );

/*!
 * @brief returns the wake up time in us
 * @param none
 * @retval wake up time in ticks
 */
int16_t HW_RTC_getMcuWakeUpTime( void );

/*!
 * @brief converts time in ms to time in ticks
 * @param [IN] time in milliseconds
 * @retval returns time in timer ticks
 */
uint32_t HW_RTC_ms2Tick( TimerTime_t timeMicroSec );

/*!
 * @brief converts time in ticks to time in ms
 * @param [IN] time in timer ticks
 * @retval returns time in timer milliseconds
 */
TimerTime_t HW_RTC_Tick2ms( uint32_t tick );

#ifdef __cplusplus
}
#endif

#endif /* __HW_RTC_H__ */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
