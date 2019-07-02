/*- Package Declaration ------------------------------------------------------*/

package ch.psi.wica.controllers;

/*- Imported packages --------------------------------------------------------*/

import ch.psi.wica.infrastructure.WicaChannelValueSerializer;
import ch.psi.wica.model.WicaChannelName;
import ch.psi.wica.model.WicaChannelValue;
import ch.psi.wica.services.channel.WicaChannelService;
import org.apache.commons.lang3.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

/*- Interface Declaration ----------------------------------------------------*/
/*- Class Declaration --------------------------------------------------------*/

/**
 * Provides a SpringBoot REST Controller to handle GET operations on the
 * {code /ca/channel} endpoint.
 */
@RestController
@RequestMapping( "/ca/channel")
class WicaChannelGetController
{

/*- Public attributes --------------------------------------------------------*/
/*- Private attributes -------------------------------------------------------*/

   private final Logger logger = LoggerFactory.getLogger( WicaChannelGetController.class );
   private final WicaChannelService wicaChannelService;
   private final int defaultTimeoutInMillis;
   private final int defaultNumericScale;

/*- Main ---------------------------------------------------------------------*/
/*- Constructor --------------------------------------------------------------*/

   /**
    * Constructs a new controller for handling channel GET requests.
    *
    * @param defaultTimeoutInMillis the default timeout that will be used
    *        when getting data from the wica channel.
    *
    * @param defaultNumericScale the defaault numeric scale that will be used
    *        when returning the value of the channel.
    *
    * @param wicaChannelService reference to the service object which can be used
    *        to get values to or from a wica channel.
    */
   private WicaChannelGetController( @Value( "${wica.channel-get-timeout-interval-in-ms}") int defaultTimeoutInMillis,
                                     @Value( "${wica.channel-get-numeric-scale}") int defaultNumericScale,
                                     @Autowired WicaChannelService wicaChannelService )
   {
      Validate.isTrue( defaultTimeoutInMillis > 0 );
      Validate.isTrue( defaultNumericScale > 0 );
      Validate.notNull( wicaChannelService );

      this.defaultTimeoutInMillis = defaultTimeoutInMillis;
      this.defaultNumericScale = defaultNumericScale;
      this.wicaChannelService = Validate.notNull( wicaChannelService );
   }

/*- Class methods ------------------------------------------------------------*/
/*- Public methods -----------------------------------------------------------*/

   /**
    * Handles an HTTP GET request to return the value of the specified channel.
    *
    * @param channelName the name of the channel whose value is to be fetched.
    *
    * @param timeoutInMillis the timeout to be applied when attempting to
    *     get the channel value from the underlying data source. If this
    *     optional parameter is not provided then the configured default
    *     value will be used.
    *
    * @param numericScale The default number of digits after the decimal
    *     point when getting the current value of a wica channel. If this
    *     *     optional parameter is not provided then the configured default
    *     *     value will be used.
    *
    * @return ResponseEntity set to return an HTTP status code of 'OK'
    *    (= 200) and a body which includes the JSON string representation of
    *    the current channel value. If a timeout occurred the JSON representation
    *    will be set to show that the channel is currently disconnected.
    */
   @GetMapping( value="/{channelName}", produces = MediaType.APPLICATION_JSON_VALUE )
   public ResponseEntity<String> getChannelValue( @PathVariable String channelName,
                                                  @RequestParam( value="timeout", required = false ) Integer timeoutInMillis,
                                                  @RequestParam( value="numericScale", required = false ) Integer numericScale )
   {
      // Check that the Spring framework gives us something in the channelName field.
      Validate.notNull( channelName, "The 'channelName' field was empty." );

      // Assign default values when not explicitly provided.
      timeoutInMillis = timeoutInMillis == null ? defaultTimeoutInMillis : timeoutInMillis;
      numericScale = numericScale == null ? defaultNumericScale : numericScale;

      logger.info( "'{}' - Handling GET channel request...", channelName );

      final WicaChannelValue wicaChannelValue = wicaChannelService.get( WicaChannelName.of( channelName ), timeoutInMillis, TimeUnit.MILLISECONDS );
      final WicaChannelValueSerializer wicaChannelValueSerializer = new WicaChannelValueSerializer( numericScale, false );

      logger.info( "'{}' - OK: Returning wica channel value.", channelName );
      return new ResponseEntity<>( wicaChannelValueSerializer.serialize( wicaChannelValue ), HttpStatus.OK );
   }

   @ExceptionHandler( Exception.class )
   public void handleException( Exception ex)
   {
      logger.warn( "Exception handler was called with exception '{}'", ex.toString() );
   }

/*- Private methods ----------------------------------------------------------*/
/*- Nested Classes -----------------------------------------------------------*/

}
