/*- Package Declaration ------------------------------------------------------*/
package ch.psi.wica.services.stream;

/*- Imported packages --------------------------------------------------------*/

import ch.psi.wica.model.WicaChannelProperties;
import ch.psi.wica.model.WicaChannelValue;
import net.jcip.annotations.Immutable;
import org.apache.commons.lang3.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;


/*- Interface Declaration ----------------------------------------------------*/
/*- Class Declaration --------------------------------------------------------*/

@Immutable
public class WicaChannelValueMapperBuilder implements WicaChannelValueMapper
{

/*- Public attributes --------------------------------------------------------*/
/*- Private attributes -------------------------------------------------------*/

   private static final Logger logger = LoggerFactory.getLogger( WicaChannelValueMapperBuilder.class );

   private final WicaChannelValueMapper filteringMapper;


/*- Main ---------------------------------------------------------------------*/
/*- Constructor --------------------------------------------------------------*/

   /**
    * Returns an instance based on the supplier mappers.
    *
    * @param filteringMapper the filtering mapper that will be applied to the initial input list.
    */
   private WicaChannelValueMapperBuilder( WicaChannelValueMapper filteringMapper )
   {
      this.filteringMapper = filteringMapper;
   }


/*- Class methods ------------------------------------------------------------*/
/*- Public methods -----------------------------------------------------------*/

   public static WicaChannelValueMapper createDefault()
   {
      final WicaChannelProperties wicaChannelProperties = new WicaChannelProperties();
      return WicaChannelValueMapperBuilder.createFromChannelProperties( wicaChannelProperties );
   }

   /**
    * Returns a channel value mapper based on the supplied channel properties object.
    *
    * @param wicaChannelProperties the channel properties object.
    * @return the returned mapper.
    */
   public static WicaChannelValueMapper createFromChannelProperties( WicaChannelProperties wicaChannelProperties )
   {
      Validate.notNull( wicaChannelProperties );

      final WicaChannelValueMapper filteringMapper;
      switch ( wicaChannelProperties.getFilterType() )
      {
         case ALL_VALUE:
            logger.info("Creating channel filter with filterType='all-value'");
            filteringMapper = new WicaChannelValueMapperAllValueSampler();
            break;

         case RATE_LIMITER:
            final int sampleGap = wicaChannelProperties.getInterval();
            logger.info("Creating channel filter with filterType='rate-limiter', interval='{}'", sampleGap );
            filteringMapper = new WicaChannelValueMapperRateLimitingSampler(sampleGap);
            break;

         case ONE_IN_N:
            final int cycleLength = wicaChannelProperties.getN();
            logger.info("Creating channel filter with filterType='one-in-n', n='{}'", cycleLength );
            filteringMapper =  new WicaChannelValueMapperFixedCycleSampler( cycleLength );
            break;

         case LAST_N:
            final int numSamples = wicaChannelProperties.getN();
            logger.info("Creating channel filter with filterType='last-n', n='{}'", numSamples );
            filteringMapper =  new WicaChannelValueMapperLatestValueSampler( numSamples );
            break;

         case CHANGE_FILTERER:
            final double deadband =wicaChannelProperties.getDeadband();
            logger.info("Creating channel filter with filterType='change-filterer', deadband='{}'", deadband );
            filteringMapper =  new WicaChannelValueMapperChangeFilteringSampler(deadband );
            break;

         default:
            logger.warn("The filterType parameter was not recognised. Using default (last-n) filter.");
            final int defaultMaxNumberOfSamples = 1;
            logger.info("Creating channel filter with filterType='last-n', n='{}'", defaultMaxNumberOfSamples );
            filteringMapper = new WicaChannelValueMapperLatestValueSampler(defaultMaxNumberOfSamples );
            break;
      }

      return filteringMapper;
   }


   /**
    * {@inheritDoc}
    */
   @Override
   public List<WicaChannelValue> map( List<WicaChannelValue> inputList )
   {
      return filteringMapper.map( inputList );
   }


/*- Private methods ----------------------------------------------------------*/
/*- Nested Classes -----------------------------------------------------------*/

}
