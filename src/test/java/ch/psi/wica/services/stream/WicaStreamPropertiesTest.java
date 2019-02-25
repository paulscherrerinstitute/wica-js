/*- Package Declaration ------------------------------------------------------*/
package ch.psi.wica.services.stream;

/*- Imported packages --------------------------------------------------------*/

import ch.psi.wica.model.WicaStreamProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/*- Interface Declaration ----------------------------------------------------*/
/*- Class Declaration --------------------------------------------------------*/

@RunWith( SpringRunner.class)
@SpringBootTest
class WicaStreamPropertiesTest
{

/*- Public attributes --------------------------------------------------------*/
/*- Private attributes -------------------------------------------------------*/
/*- Main ---------------------------------------------------------------------*/
/*- Constructor --------------------------------------------------------------*/
/*- Class methods ------------------------------------------------------------*/
/*- Public methods -----------------------------------------------------------*/

   @Test
   void testUnrecognisedFieldThrowsException() throws Exception
   {
      final ObjectMapper mapper = new ObjectMapper();
      final String inputString = "{" + "\"XXX\"" + ":" + 12345 + "}";
      assertThrows( UnrecognizedPropertyException.class, () -> {
         mapper.readValue( inputString, WicaStreamProperties.class);
      } );
   }


   @Test
   void testAllFieldsPresentDecodedOk() throws Exception
   {
      final ObjectMapper mapper = new ObjectMapper();

      final String inputString = "{" + "\"heartbeat\"" + ":" + 12345 + "," +
                                       "\"changeint\"" + ":" + 99 + "," +
                                       "\"pollint\""   + ":" + 101 + "," +
                                       "\"daqmode\""   + ":" + "\"poll-and-monitor\"" + "," +
                                       "\"fields\""    + ":" + "\"abc;def\"" + "," +
                                       "\"prec\""      + ":" + 9 + "}";

      final WicaStreamProperties props = mapper.readValue( inputString, WicaStreamProperties.class );
      assertEquals( 12345, props.getHeartbeatFluxIntervalInMillis() );
      assertEquals( 99, props.getChangedValueFluxIntervalInMillis() );
      assertEquals( 101, props.getPolledValueFluxIntervalInMillis() );
      assertEquals( "POLL_AND_MONITOR", props.getDataAcquisitionMode().toString() );
      assertEquals( 9, props.getNumericPrecision() );
      assertEquals( Set.of( "abc", "def" ), props.getFieldsOfInterest() );
   }

   @Test
   void testDefaultFieldValues() throws Exception
   {
      final ObjectMapper mapper = new ObjectMapper();
      final String inputString = "{}";
      final WicaStreamProperties props = mapper.readValue( inputString, WicaStreamProperties.class );
      assertEquals( WicaStreamProperties.DEFAULT_HEARTBEAT_FLUX_INTERVAL_IN_MILLIS, props.getHeartbeatFluxIntervalInMillis() );
      assertEquals( WicaStreamProperties.DEFAULT_CHANGED_VALUE_FLUX_INTERVAL_IN_MILLIS, props.getChangedValueFluxIntervalInMillis() );
      assertEquals( WicaStreamProperties.DEFAULT_POLLED_VALUE_FLUX_INTERVAL_IN_MILLIS, props.getPolledValueFluxIntervalInMillis() );
      assertEquals( WicaStreamProperties.DEFAULT_POLLED_VALUE_SAMPLE_RATIO, props.getPolledValueSampleRatio() );
      assertEquals( WicaStreamProperties.DEFAULT_NUMERIC_PRECISION, props.getNumericPrecision() );
      assertEquals( WicaStreamProperties.DEFAULT_DATA_ACQUISITION_MODE, props.getDataAcquisitionMode() );
      assertEquals( Set.of( WicaStreamProperties.DEFAULT_FIELDS_OF_INTEREST.split(";") ), props.getFieldsOfInterest() );
   }

/*- Private methods ----------------------------------------------------------*/
/*- Nested Classes -----------------------------------------------------------*/

}