/*- Package Declaration ------------------------------------------------------*/
package ch.psi.wica.infrastructure;

/*- Imported packages --------------------------------------------------------*/

import ch.psi.wica.model.WicaChannelName;
import ch.psi.wica.model.WicaChannelValue;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import net.jcip.annotations.Immutable;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;


/*- Interface Declaration ----------------------------------------------------*/
/*- Class Declaration --------------------------------------------------------*/

@Immutable
public class WicaChannelValueMapSerializer
{

/*- Public attributes --------------------------------------------------------*/
/*- Private attributes -------------------------------------------------------*/

   private final ObjectMapper mapper;

/*- Main ---------------------------------------------------------------------*/
/*- Constructor --------------------------------------------------------------*/

   public WicaChannelValueMapSerializer( NumericScaleSupplier numericScaleSupplier,
                                         boolean writeNanAsString,
                                         boolean writeInfinityAsString,
                                         FieldsOfInterestSupplier fieldsOfInterestSupplier )
   {
        final SimpleModule module = new SimpleModule();
        module.addSerializer( new MyCustomWicaChannelValueMapSerializer( numericScaleSupplier, writeNanAsString, writeInfinityAsString, fieldsOfInterestSupplier ) );
        mapper = new Jackson2ObjectMapperBuilder().createXmlMapper( false ).build();
        mapper.registerModule(module );
   }

/*- Class methods ------------------------------------------------------------*/
/*- Public methods -----------------------------------------------------------*/

    public String serialize( Map<WicaChannelName,List<WicaChannelValue>> channelValueMap )
   {
      try
      {
         return mapper.writeValueAsString( channelValueMap );
      }
      catch( JsonProcessingException ex )
      {
         throw new RuntimeException( "RuntimeException: " + ex.getMessage(), ex.getCause() );
      }
   }


/*- Private methods ----------------------------------------------------------*/
/*- Nested Interfaces --------------------------------------------------------*/

   public interface NumericScaleSupplier
   {
      int supplyForChannelNamed( WicaChannelName wicaChannelName );
   }

   public interface FieldsOfInterestSupplier
   {
      Set<String> supplyForChannelNamed( WicaChannelName wicaChannelName );
   }

/*- Nested Classes -----------------------------------------------------------*/

   private static class MyCustomWicaChannelValueMapSerializer extends StdSerializer<Map>
   {
      final NumericScaleSupplier numericScaleSupplier;
      final boolean writeNanAsString;
      final boolean writeInfinityAsString;
      final FieldsOfInterestSupplier fieldsOfInterestSupplier;

      MyCustomWicaChannelValueMapSerializer( NumericScaleSupplier numericScaleSupplier,
                                             boolean writeNanAsString,
                                             boolean writeInfinityAsString,
                                             FieldsOfInterestSupplier fieldsOfInterestSupplier )
      {
         super( Map.class );
         this.numericScaleSupplier = numericScaleSupplier;
         this.writeNanAsString  = writeNanAsString;
         this.writeInfinityAsString = writeInfinityAsString;
         this.fieldsOfInterestSupplier = fieldsOfInterestSupplier;
      }

      @Override
      public void serialize( Map value, JsonGenerator gen, SerializerProvider serializers ) throws IOException
      {
         gen.writeStartObject();
         for ( Object channelName : value.keySet() )
         {
            final WicaChannelName wicaChannelName = (WicaChannelName) channelName;

            final int numericScale = numericScaleSupplier.supplyForChannelNamed( wicaChannelName );

            final WicaChannelDataSerializer serializer;
            if ( fieldsOfInterestSupplier.supplyForChannelNamed( wicaChannelName ).size() == 0 )
            {
               serializer = new WicaChannelDataSerializer( numericScale, writeNanAsString, writeInfinityAsString );
            }
            else
            {
               final String[] fieldsOfInterest = fieldsOfInterestSupplier.supplyForChannelNamed( wicaChannelName ).toArray( new String[] {} );
               serializer = new WicaChannelDataSerializer( numericScale, writeNanAsString, writeInfinityAsString, fieldsOfInterest );
            }

            gen.writeFieldName( wicaChannelName.toString() );

            // This cast is ok. Unfortunately this method cannot be generified because
            // then it would not satisfy the requirements of the interface.
            @SuppressWarnings( "unchecked")
            final List<WicaChannelValue> wicaChannelValueList = (List<WicaChannelValue>) value.get( wicaChannelName );
            gen.writeStartArray();
            for ( WicaChannelValue wicaChannelValue : wicaChannelValueList )
            {
               final String str = serializer.serialize( wicaChannelValue );
               gen.writeRawValue(str);
            }
            gen.writeEndArray();
         }
         gen.writeEndObject();
      }
   }

}
