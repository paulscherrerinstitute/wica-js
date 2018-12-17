/*- Package Declaration ------------------------------------------------------*/
package ch.psi.wica.model;

/*- Imported packages --------------------------------------------------------*/

import com.fasterxml.jackson.annotation.*;
import net.jcip.annotations.Immutable;
import org.apache.commons.lang3.Validate;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Objects;

/*- Interface Declaration ----------------------------------------------------*/
/*- Class Declaration --------------------------------------------------------*/

@JsonFilter( "WicaChannelValueFilter" )
@JsonPropertyOrder( { "conn", "type", "val", "sevr", "stat", "ts", "wsts", "wsts-alt", "dsts", "dsts-alt" } )
@Immutable
public abstract class WicaChannelValue
{

/*- Public attributes --------------------------------------------------------*/
/*- Private attributes -------------------------------------------------------*/

   private final boolean connected;
   private final LocalDateTime wicaServerTimestamp;

/*- Main ---------------------------------------------------------------------*/
/*- Constructor --------------------------------------------------------------*/

   private WicaChannelValue( boolean connected, LocalDateTime wicaServerTimestamp )
   {
      this.connected = connected;
      this.wicaServerTimestamp = Validate.notNull( wicaServerTimestamp, "wicaServerTimestamp cannot be null" );
   }

/*- Class methods ------------------------------------------------------------*/

   public static WicaChannelValue createChannelValueDisconnected()
   {
      return new WicaChannelValueDisconnected();
   }

   public static WicaChannelValue createChannelValueConnected( double value )
   {
      return new WicaChannelValueConnectedReal( WicaChannelAlarmSeverity.NO_ALARM, WicaChannelAlarmStatus.ofNoError(), LocalDateTime.now(), value );
   }

   public static WicaChannelValue createChannelValueConnected( WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp, double value  )
   {
      return new WicaChannelValueConnectedReal( wicaChannelAlarmSeverity, wicaChannelAlarmStatus, dataSourceTimestamp, value );
   }

   public static WicaChannelValue createChannelValueConnected( double[] value )
   {
      return new WicaChannelValueConnectedRealArray( WicaChannelAlarmSeverity.NO_ALARM, WicaChannelAlarmStatus.ofNoError(), LocalDateTime.now(), value );
   }

   public static WicaChannelValue createChannelValueConnected( WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp, double[] value  )
   {
      return new WicaChannelValueConnectedRealArray( wicaChannelAlarmSeverity, wicaChannelAlarmStatus, dataSourceTimestamp, value );
   }

   public static WicaChannelValue createChannelValueConnected( int value )
   {
      return new WicaChannelValueConnectedInteger( WicaChannelAlarmSeverity.NO_ALARM, WicaChannelAlarmStatus.ofNoError(), LocalDateTime.now(), value );
   }

   public static WicaChannelValue createChannelValueConnected( WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp, int value  )
   {
      return new WicaChannelValueConnectedInteger( wicaChannelAlarmSeverity, wicaChannelAlarmStatus, dataSourceTimestamp, value );
   }

   public static WicaChannelValue createChannelValueConnected( int[] value )
   {
      return new WicaChannelValueConnectedIntegerArray( WicaChannelAlarmSeverity.NO_ALARM, WicaChannelAlarmStatus.ofNoError(), LocalDateTime.now(), value );
   }

   public static WicaChannelValue createChannelValueConnected( WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp, int[] value  )
   {
      return new WicaChannelValueConnectedIntegerArray( wicaChannelAlarmSeverity, wicaChannelAlarmStatus, dataSourceTimestamp, value );
   }

   public static WicaChannelValue createChannelValueConnected( String value )
   {
      return new WicaChannelValueConnectedString( WicaChannelAlarmSeverity.NO_ALARM, WicaChannelAlarmStatus.ofNoError(), LocalDateTime.now(), value );
   }

   public static WicaChannelValue createChannelValueConnected( WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp, String value  )
   {
      return new WicaChannelValueConnectedString( wicaChannelAlarmSeverity, wicaChannelAlarmStatus, dataSourceTimestamp, value );
   }

   public static WicaChannelValue createChannelValueConnected( String[] value )
   {
      return new WicaChannelValueConnectedStringArray( WicaChannelAlarmSeverity.NO_ALARM, WicaChannelAlarmStatus.ofNoError(), LocalDateTime.now(), value );
   }

   public static WicaChannelValue createChannelValueConnected( WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp, String[] value  )
   {
      return new WicaChannelValueConnectedStringArray( wicaChannelAlarmSeverity, wicaChannelAlarmStatus, dataSourceTimestamp, value );
   }


/*- Public methods -----------------------------------------------------------*/

   @JsonProperty( "conn" )
   public boolean isConnected()
   {
      return connected;
   }

   @JsonProperty( "wsts" )
   public LocalDateTime getWicaServerTimestamp()
   {
      return this.wicaServerTimestamp;
   }

   @JsonProperty( "wsts-alt" )
   public long getWicaServerTimestampAlt()
   {
      return this.wicaServerTimestamp.atOffset(ZoneOffset.UTC).toInstant().toEpochMilli();
   }


/*- Private methods ----------------------------------------------------------*/
/*- Nested Classes -----------------------------------------------------------*/

/*- Nested Class: WicaChannelValueDisconnected -------------------------------*/

   public static class WicaChannelValueDisconnected extends WicaChannelValue
   {
      private WicaChannelValueDisconnected()
      {
         this( LocalDateTime.now() );
      }

      private WicaChannelValueDisconnected( LocalDateTime wicaServerTimestamp )
      {
         super(false,wicaServerTimestamp );
      }
   }

/*- Nested Class: WicaChannelValueConnected ----------------------------------*/

   public static abstract class WicaChannelValueConnected extends WicaChannelValue
   {
      private final WicaChannelType wicaChannelType;
      private final WicaChannelAlarmSeverity wicaChannelAlarmSeverity;
      private final WicaChannelAlarmStatus wicaChannelAlarmStatus;
      private final LocalDateTime dataSourceTimestamp;

      @JsonProperty( "type" )
      public WicaChannelType getWicaChannelType()
      {
         return wicaChannelType;
      }

      @JsonProperty( "sevr" )
      public int getWicaAlarmSeverity()
      {
         return wicaChannelAlarmSeverity.ordinal();
      }

      @JsonProperty( "stat" )
      public int getWicaChannelAlarmStatus()
      {
         return wicaChannelAlarmStatus.getStatusCode();
      }

      @JsonProperty( "ts" )
      public LocalDateTime getDataSourceTimestamp()
      {
         return dataSourceTimestamp;
      }

      @JsonProperty( "dsts-alt" )
      public long getDataSourceTimestampAlt()
      {
         return dataSourceTimestamp.atOffset( ZoneOffset.UTC ).toInstant().toEpochMilli();
      }

      private WicaChannelValueConnected( WicaChannelType wicaChannelType, WicaChannelAlarmSeverity wicaChannelAlarmSeverity, WicaChannelAlarmStatus wicaChannelAlarmStatus, LocalDateTime dataSourceTimestamp )
      {
         super(true, LocalDateTime.now());
         this.wicaChannelType = Validate.notNull( wicaChannelType, "wicaChannelType cannot be null " );
         this.wicaChannelAlarmSeverity = Validate.notNull( wicaChannelAlarmSeverity, "wicaAlarmSeverity cannot be null " );
         this.wicaChannelAlarmStatus = Validate.notNull( wicaChannelAlarmStatus, "wicaAlarmStatus cannot be null " );
         this.dataSourceTimestamp = Validate.notNull( dataSourceTimestamp,"dataSourceTimestamp cannot be null " );
      }
   }

/*- Nested Class: WicaChannelValueConnectedReal -----------------------------*/

   public static class WicaChannelValueConnectedReal extends WicaChannelValueConnected
   {
      private final double value;

      @JsonProperty( "val" )
      public double getValue()
      {
         return value;
      }

      private WicaChannelValueConnectedReal( WicaChannelAlarmSeverity alarmSeverity, WicaChannelAlarmStatus alarmStatus, LocalDateTime dataSourceTimestamp, double value )
      {
         super(WicaChannelType.REAL, alarmSeverity, alarmStatus, dataSourceTimestamp );
         this.value = value;
      }
   }

/*- Nested Class: WicaChannelValueConnectedRealArray ------------------------*/

   public static class WicaChannelValueConnectedRealArray extends WicaChannelValueConnected
   {
      private final double[] value;

      @JsonProperty( "val" )
      public double[] getValue()
      {
         return value;
      }

      private WicaChannelValueConnectedRealArray( WicaChannelAlarmSeverity alarmSeverity, WicaChannelAlarmStatus alarmStatus, LocalDateTime dataSourceTimestamp, double[] value )
      {
         super(WicaChannelType.REAL_ARRAY, alarmSeverity, alarmStatus, dataSourceTimestamp );
         this.value = value;
      }
   }

/*- Nested Class: WicaChannelValueConnectedInteger --------------------------*/

   public static class WicaChannelValueConnectedInteger extends WicaChannelValueConnected
   {
      private final int value;

      @JsonProperty( "val" )
      public int getValue()
      {
         return value;
      }

      private WicaChannelValueConnectedInteger( WicaChannelAlarmSeverity alarmSeverity, WicaChannelAlarmStatus alarmStatus, LocalDateTime dataSourceTimestamp, int value )
      {
         super(WicaChannelType.INTEGER, alarmSeverity, alarmStatus, dataSourceTimestamp);
         this.value = value;
      }
   }

/*- Nested Class: WicaChannelValueConnectedIntegerArray ---------------------*/

   public static class WicaChannelValueConnectedIntegerArray extends WicaChannelValueConnected
   {
      private final int[] value;

      @JsonProperty( "val" )
      public int[] getValue()
      {
         return value;
      }

      private WicaChannelValueConnectedIntegerArray( WicaChannelAlarmSeverity alarmSeverity, WicaChannelAlarmStatus alarmStatus, LocalDateTime dataSourceTimestamp, int[] value )
      {
         super(WicaChannelType.INTEGER, alarmSeverity, alarmStatus, dataSourceTimestamp);
         this.value = value;
      }
   }


/*- Nested Class: WicaChannelValueConnectedString ---------------------------*/

   public static class WicaChannelValueConnectedString extends WicaChannelValueConnected
   {
      private final String value;

      @JsonProperty( "val" )
      public String getValue()
      {
         return value;
      }

      private WicaChannelValueConnectedString( WicaChannelAlarmSeverity alarmSeverity, WicaChannelAlarmStatus alarmStatus, LocalDateTime dataSourceTimestamp, String value )
      {
         super( WicaChannelType.STRING, alarmSeverity, alarmStatus, dataSourceTimestamp);
         this.value = value;
      }
   }

/*- Nested Class: WicaChannelValueConnectedStringArray ----------------------*/

   private static class WicaChannelValueConnectedStringArray extends WicaChannelValueConnected
   {
      private final String[] value;

      @JsonProperty( "val" )
      public String[] getValue()
      {
         return value;
      }

      private WicaChannelValueConnectedStringArray( WicaChannelAlarmSeverity alarmSeverity, WicaChannelAlarmStatus alarmStatus, LocalDateTime dataSourceTimestamp, String[] value )
      {
         super( WicaChannelType.STRING, alarmSeverity, alarmStatus, dataSourceTimestamp);
         this.value = value;
      }
   }

/*- Json View Classes -------------------------------------------------------*/

}