/**
  ******************************************************************************
  * @file    lrwan_ns1.h
  * @author  MEMS Application Team
  * @brief   This file contains definitions for the lrwan_ns1.c
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
#ifndef __LRWAN_NS1_H
#define __LRWAN_NS1_H

#ifdef __cplusplus
extern "C" {
#endif



/* Includes ------------------------------------------------------------------*/

#ifdef USE_STM32F4XX_NUCLEO
#include "stm32f4xx_hal.h"
#endif

#ifdef USE_STM32L0XX_NUCLEO
#include "stm32l0xx_hal.h"
#endif

#ifdef USE_STM32L1XX_NUCLEO
#include "stm32l1xx_hal.h"
#endif

#ifdef USE_STM32L4XX_NUCLEO
#include "stm32l4xx_hal.h"
#endif

#include "accelerometer.h"
#include "gyroscope.h"
#include "magnetometer.h"
#include "humidity.h"
#include "temperature.h"
#include "pressure.h"

/** @addtogroup BSP BSP
 * @{
 */

/** @addtogroup LRWAN_NS1 LRWAN_NS1
 * @{
 */

/** @addtogroup LRWAN_NS1_IO IO
 * @{
 */

/** @addtogroup LRWAN_NS1_IO_Public_Constants Public constants
 * @{
 */

/* I2C clock speed configuration (in Hz) */
#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)))
#define NUCLEO_I2C_EXPBD_SPEED                         400000
#endif /* USE_STM32F4XX_NUCLEO or USE_STM32L1XX_NUCLEO */

/* Timing samples for L0 with SYSCLK 32MHz set in SystemClock_Config() */
#if (defined (USE_STM32L0XX_NUCLEO))
#define NUCLEO_I2C_EXPBD_TIMING_100KHZ       0x10A13E56 /* Analog Filter ON, Rise Time 400ns, Fall Time 100ns */
#define NUCLEO_I2C_EXPBD_TIMING_400KHZ       0x00B1112E /* Analog Filter ON, Rise Time 250ns, Fall Time 100ns */
#endif /* USE_STM32L0XX_NUCLEO */

/* Timing samples for L4 with SYSCLK 80MHz set in SystemClock_Config() */
#if (defined (USE_STM32L4XX_NUCLEO))
#define NUCLEO_I2C_EXPBD_TIMING_400KHZ       0x10D1143A /* Analog Filter ON, Rise time 250ns, Fall Time 100ns */
#define NUCLEO_I2C_EXPBD_TIMING_1000KHZ      0x00D00E28 /* Analog Filter ON, Rise time 120ns, Fall time 25ns */
#endif /* USE_STM32L4XX_NUCLEO */

/* I2C peripheral configuration defines */
#define NUCLEO_I2C_EXPBD                            I2C1
#define NUCLEO_I2C_EXPBD_CLK_ENABLE()               __I2C1_CLK_ENABLE()
#define NUCLEO_I2C_EXPBD_SCL_SDA_GPIO_CLK_ENABLE()  __GPIOB_CLK_ENABLE()
#define NUCLEO_I2C_EXPBD_SCL_SDA_AF                 GPIO_AF4_I2C1
#define NUCLEO_I2C_EXPBD_SCL_SDA_GPIO_PORT          GPIOB
#define NUCLEO_I2C_EXPBD_SCL_PIN                    GPIO_PIN_8
#define NUCLEO_I2C_EXPBD_SDA_PIN                    GPIO_PIN_9

#define NUCLEO_I2C_EXPBD_FORCE_RESET()              __I2C1_FORCE_RESET()
#define NUCLEO_I2C_EXPBD_RELEASE_RESET()            __I2C1_RELEASE_RESET()

/* I2C interrupt requests */
#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define NUCLEO_I2C_EXPBD_EV_IRQn                    I2C1_EV_IRQn
#define NUCLEO_I2C_EXPBD_ER_IRQn                    I2C1_ER_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define NUCLEO_I2C_EXPBD_EV_IRQn                    I2C1_IRQn
#endif

/* Maximum Timeout values for flags waiting loops. These timeouts are not based
   on accurate values, they just guarantee that the application will not remain
   stuck if the I2C communication is corrupted.
   You may modify these timeout values depending on CPU frequency and application
   conditions (interrupts routines ...). */
#define NUCLEO_I2C_EXPBD_TIMEOUT_MAX    0x1000 /*<! The value of the maximal timeout for BUS waiting loops */

/* Definition for interrupt Pins */
#define HTS221_DRDY_GPIO_PORT           GPIOA
#define HTS221_DRDY_GPIO_CLK_ENABLE()   __GPIOA_CLK_ENABLE()
#define HTS221_DRDY_GPIO_CLK_DISABLE()  __GPIOA_CLK_DISABLE()
#define HTS221_DRDY_PIN                 GPIO_PIN_8

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define HTS221_DRDY_EXTI_IRQn           EXTI9_5_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define HTS221_DRDY_EXTI_IRQn           EXTI4_15_IRQn
#endif

#define LSM6DS0_INT1_GPIO_PORT           GPIOB
#define LSM6DS0_INT1_GPIO_CLK_ENABLE()   __GPIOB_CLK_ENABLE()
#define LSM6DS0_INT1_GPIO_CLK_DISABLE()  __GPIOB_CLK_DISABLE()
#define LSM6DS0_INT1_PIN                 GPIO_PIN_5

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define LSM6DS0_INT1_EXTI_IRQn           EXTI9_5_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define LSM6DS0_INT1_EXTI_IRQn           EXTI4_15_IRQn
#endif

#define LSM6DS3_INT1_GPIO_PORT           GPIOA
#define LSM6DS3_INT1_GPIO_CLK_ENABLE()   __GPIOA_CLK_ENABLE()
#define LSM6DS3_INT1_GPIO_CLK_DISABLE()  __GPIOA_CLK_DISABLE()
#define LSM6DS3_INT1_PIN                 GPIO_PIN_1

#define LSM6DS3_INT2_GPIO_PORT           GPIOA
#define LSM6DS3_INT2_GPIO_CLK_ENABLE()   __GPIOA_CLK_ENABLE()
#define LSM6DS3_INT2_GPIO_CLK_DISABLE()  __GPIOA_CLK_DISABLE()
#define LSM6DS3_INT2_PIN                 GPIO_PIN_4

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define LSM6DS3_INT1_EXTI_IRQn           EXTI1_IRQn
#define LSM6DS3_INT2_EXTI_IRQn           EXTI4_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define LSM6DS3_INT1_EXTI_IRQn           EXTI0_1_IRQn
#define LSM6DS3_INT2_EXTI_IRQn           EXTI4_15_IRQn
#endif

#define LIS3MDL_DRDY_GPIO_PORT           GPIOA
#define LIS3MDL_DRDY_GPIO_CLK_ENABLE()   __GPIOA_CLK_ENABLE()
#define LIS3MDL_DRDY_GPIO_CLK_DISABLE()  __GPIOA_CLK_DISABLE()
#define LIS3MDL_DRDY_PIN                 GPIO_PIN_2

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define LIS3MDL_DRDY_EXTI_IRQn           EXTI2_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define LIS3MDL_DRDY_EXTI_IRQn           EXTI2_3_IRQn
#endif

#define LIS3MDL_INT1_GPIO_PORT           GPIOA
#define LIS3MDL_INT1_GPIO_CLK_ENABLE()   __GPIOA_CLK_ENABLE()
#define LIS3MDL_INT1_GPIO_CLK_DISABLE()  __GPIOA_CLK_DISABLE()
#define LIS3MDL_INT1_PIN                 GPIO_PIN_3

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define LIS3MDL_INT1_EXTI_IRQn           EXTI3_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define LIS3MDL_INT1_EXTI_IRQn           EXTI2_3_IRQn
#endif

#define LPS25HB_INT1_GPIO_PORT           GPIOB
#define LPS25HB_INT1_GPIO_CLK_ENABLE()   __GPIOB_CLK_ENABLE()
#define LPS25HB_INT1_GPIO_CLK_DISABLE()  __GPIOB_CLK_DISABLE()
#define LPS25HB_INT1_PIN                 GPIO_PIN_4

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define LPS25HB_INT1_EXTI_IRQn           EXTI4_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define LPS25HB_INT1_EXTI_IRQn           EXTI4_15_IRQn
#endif

#define LPS22HB_INT1_GPIO_PORT           GPIOB
#define LPS22HB_INT1_GPIO_CLK_ENABLE()   __GPIOB_CLK_ENABLE()
#define LPS22HB_INT1_GPIO_CLK_DISABLE()  __GPIOB_CLK_DISABLE()
#define LPS22HB_INT1_PIN                 GPIO_PIN_10

#if ((defined (USE_STM32F4XX_NUCLEO)) || (defined (USE_STM32L1XX_NUCLEO)) || (defined (USE_STM32L4XX_NUCLEO)))
#define LPS22HB_INT1_EXTI_IRQn           EXTI15_10_IRQn
#endif

#if (defined (USE_STM32L0XX_NUCLEO))
#define LPS22HB_INT1_EXTI_IRQn           EXTI4_15_IRQn
#endif

/**
  * @}
  */

/** @addtogroup LRWAN_NS1_IO_Public_FunctionPrototypes Public function prototypes
 * @{
 */

DrvStatusTypeDef Sensor_IO_Init( void );
DrvStatusTypeDef LSM6DS0_Sensor_IO_ITConfig( void );
DrvStatusTypeDef LSM6DS3_Sensor_IO_ITConfig( void );
DrvStatusTypeDef LPS22HB_Sensor_IO_ITConfig( void );

/**
  * @}
  */

/**
  * @}
  */

/**
  * @}
  */

/**
  * @}
  */

#ifdef __cplusplus
}
#endif

#endif /* __LRWAN_NS1_H */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
