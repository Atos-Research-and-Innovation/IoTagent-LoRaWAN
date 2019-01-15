/*
 / _____)             _              | |
( (____  _____ ____ _| |_ _____  ____| |__
 \____ \| ___ |    (_   _) ___ |/ ___)  _ \
 _____) ) ____| | | || |_| ____( (___| | | |
(______/|_____)_|_|_| \__)_____)\____)_| |_|
    (C)2013 Semtech

Description: Bleeper board SPI driver implementation

License: Revised BSD License, see LICENSE.TXT file include in the project

Maintainer: Miguel Luis and Gregory Cristian
*/
/**
  ******************************************************************************
  * @file    hw_spi.c
  * @author  MCD Application Team
  * @brief   manages the SPI interface
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

#if 0
/* Includes ------------------------------------------------------------------*/
#include "hw.h"
#include "utilities.h"


/* Private typedef -----------------------------------------------------------*/
/* Private define ------------------------------------------------------------*/
/* Private macro -------------------------------------------------------------*/
/* Private variables ---------------------------------------------------------*/
static SPI_HandleTypeDef hspi;
/* Private function prototypes -----------------------------------------------*/

/*!
 * @brief Calculates Spi Divisor based on Spi Frequency and Mcu Frequency
 *
 * @param [IN] Spi Frequency
 * @retval Spi divisor
 */
static uint32_t SpiFrequency( uint32_t hz );

/* Exported functions ---------------------------------------------------------*/

/*!
 * @brief Initializes the SPI object and MCU peripheral
 *
 * @param [IN] none
 */
void HW_SPI_Init( void )
{
  
  /*##-1- Configure the SPI peripheral */
  /* Set the SPI parameters */

  hspi.Instance = SPI1;

  hspi.Init.BaudRatePrescaler = SpiFrequency( 10000000 );
  hspi.Init.Direction      = SPI_DIRECTION_2LINES;
  hspi.Init.Mode           = SPI_MODE_MASTER;
  hspi.Init.CLKPolarity    = SPI_POLARITY_LOW;
  hspi.Init.CLKPhase       = SPI_PHASE_1EDGE;
  hspi.Init.DataSize       = SPI_DATASIZE_8BIT;
  hspi.Init.CRCCalculation = SPI_CRCCALCULATION_DISABLE;  
  hspi.Init.FirstBit       = SPI_FIRSTBIT_MSB;
  hspi.Init.NSS            = SPI_NSS_SOFT;
  hspi.Init.TIMode         = SPI_TIMODE_DISABLE;


  SPI_CLK_ENABLE(); 


  if(HAL_SPI_Init( &hspi) != HAL_OK)
  {
    /* Initialization Error */
     Error_Handler();
  }

  /*##-2- Configure the SPI GPIOs */
  HW_SPI_IoInit(  );
}

/*!
 * @brief De-initializes the SPI object and MCU peripheral
 *
 * @param [IN] none
 */
void HW_SPI_DeInit( void )
{

  HAL_SPI_DeInit( &hspi);

    /*##-1- Reset peripherals ####*/
  __HAL_RCC_SPI1_FORCE_RESET();
  __HAL_RCC_SPI1_RELEASE_RESET();
  /*##-2- Configure the SPI GPIOs */
  HW_SPI_IoDeInit( );
}

void HW_SPI_IoInit( void )
{
  GPIO_InitTypeDef initStruct={0};
  

  initStruct.Mode =GPIO_MODE_AF_PP;
  initStruct.Pull =GPIO_NOPULL  ;
  initStruct.Speed = GPIO_SPEED_HIGH;
  initStruct.Alternate= SPI1_AF ;

  HW_GPIO_Init( RADIO_SCLK_PORT, RADIO_SCLK_PIN, &initStruct);
  HW_GPIO_Init( RADIO_MISO_PORT, RADIO_MISO_PIN, &initStruct);
  HW_GPIO_Init( RADIO_MOSI_PORT, RADIO_MOSI_PIN, &initStruct);

  initStruct.Mode = GPIO_MODE_OUTPUT_PP;
  initStruct.Pull = GPIO_NOPULL;

  HW_GPIO_Init(  RADIO_NSS_PORT, RADIO_NSS_PIN, &initStruct );

  HW_GPIO_Write ( RADIO_NSS_PORT, RADIO_NSS_PIN, 1 );
}

void HW_SPI_IoDeInit( void )
{
  GPIO_InitTypeDef initStruct={0};
    
  initStruct.Mode =GPIO_MODE_OUTPUT_PP;

  initStruct.Pull =GPIO_NOPULL  ; 
  HW_GPIO_Init ( RADIO_MOSI_PORT, RADIO_MOSI_PIN, &initStruct ); 
  HW_GPIO_Write( RADIO_MOSI_PORT, RADIO_MOSI_PIN, 0 );
  
  initStruct.Pull =GPIO_PULLDOWN; 
  HW_GPIO_Init ( RADIO_MISO_PORT, RADIO_MISO_PIN, &initStruct ); 
  HW_GPIO_Write( RADIO_MISO_PORT, RADIO_MISO_PIN, 0 );
  
  initStruct.Pull =GPIO_NOPULL  ; 
  HW_GPIO_Init ( RADIO_SCLK_PORT, RADIO_SCLK_PIN, &initStruct ); 
  HW_GPIO_Write(  RADIO_SCLK_PORT, RADIO_SCLK_PIN, 0 );

  initStruct.Pull =GPIO_NOPULL  ; 
  HW_GPIO_Init ( RADIO_NSS_PORT, RADIO_NSS_PIN , &initStruct ); 
  HW_GPIO_Write( RADIO_NSS_PORT, RADIO_NSS_PIN , 1 );
}

/*!
 * @brief Sends outData and receives inData
 *
 * @param [IN] outData Byte to be sent
 * @retval inData      Received byte.
 */
uint16_t HW_SPI_InOut( uint16_t txData )
{
  uint16_t rxData ;

  HAL_SPI_TransmitReceive( &hspi, ( uint8_t * ) &txData, ( uint8_t* ) &rxData, 1, HAL_MAX_DELAY);	

  return rxData;
}

/* Private functions ---------------------------------------------------------*/

static uint32_t SpiFrequency( uint32_t hz )
{
  uint32_t divisor = 0;
  uint32_t SysClkTmp = SystemCoreClock;
  uint32_t baudRate;
  
  while( SysClkTmp > hz)
  {
    divisor++;
    SysClkTmp= ( SysClkTmp >> 1);
    
    if (divisor >= 7)
      break;
  }
  
  baudRate =((( divisor & 0x4 ) == 0 )? 0x0 : SPI_CR1_BR_2  )| 
            ((( divisor & 0x2 ) == 0 )? 0x0 : SPI_CR1_BR_1  )| 
            ((( divisor & 0x1 ) == 0 )? 0x0 : SPI_CR1_BR_0  );
  
  return baudRate;
}

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/

#endif